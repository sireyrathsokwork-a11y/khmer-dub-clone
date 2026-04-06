require('dotenv').config();
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { transcribeAudio } = require('../services/transcribe');
const { translateToKhmer } = require('../services/translate');
const { textToSpeechKhmer } = require('../services/tts');
const { mergeAudioWithVideo } = require('../services/merge');
const clients = new Map();

function sendStatus(jobId, status, data = {}) {
  const client = clients.get(jobId);
  if (client) {
    client.write(`data: ${JSON.stringify({ status, ...data })}\n\n`);
  }
}

// GET /api/dub/video/:jobId
router.get('/video/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const tempDir = path.join(__dirname, '../../temp');

  // Find the latest dubbed file for this jobId
  const files = fs
    .readdirSync(tempDir)
    .filter((f) => f.startsWith(`${jobId}_dubbed`) && f.endsWith('.mp4'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return res.status(404).json({ error: 'Video not found' });
  }

  res.sendFile(path.join(tempDir, files[0]));
});

// GET /api/dub/status/:jobId
router.get('/status/:jobId', (req, res) => {
  const jobId = parseInt(req.params.jobId);

  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  clients.set(jobId, res);

  req.on('close', () => {
    clients.delete(jobId);
  });
});

router.post('/process', async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ error: 'youtubeUrl is required' });
    }

    const isYouTube =
      youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be');

    if (!isYouTube) {
      return res
        .status(400)
        .json({ error: 'URL must be a valid YouTube link' });
    }

    const jobId = Date.now();
    const audioPath = path.join(
      __dirname,
      '../../temp',
      `${jobId}_original.mp3`,
    );
    const videoPath = path.join(
      __dirname,
      '../../temp',
      `${jobId}_original.mp4`,
    );

    res.json({ status: 'processing', jobId, message: 'Starting pipeline...' });

    // Step 1a — Download audio for transcription
    const audioCommand = `yt-dlp -x --audio-format mp3 --js-runtime node --remote-components ejs:github --extractor-args "youtube:player_client=web_embedded" --user-agent \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\" --socket-timeout 30 --retries 3 --sleep-requests 2 -o \"${audioPath}\" \"${youtubeUrl}\"`;

    // Step 1b — Download video for merging
    const videoCommand = `yt-dlp -f \"best[ext=mp4]\" --js-runtime node --remote-components ejs:github --extractor-args "youtube:player_client=web_embedded" --user-agent \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\" --socket-timeout 30 --retries 3 --sleep-requests 2 -o \"${videoPath}\" \"${youtubeUrl}\"`;

    exec(audioCommand, async (error) => {

      if (error) {
        console.error('Audio download error:', error.message);
        sendStatus(jobId, 'error', { message: error.message });
        return;
      }
      sendStatus(jobId, 'transcribing');
      console.log('Audio downloaded.');

      exec(videoCommand, async (error) => {
        if (error) {
          console.error('Video download error:', error.message);
          sendStatus(jobId, 'error', { message: error.message });
          return;
        }
        console.log('Video downloaded.');

        try {
          // Step 2 — Transcribe
          sendStatus(jobId, 'transcribing');
          const transcription = await transcribeAudio(audioPath);
          console.log('Transcription complete.');

          // Step 3 — Translate
          sendStatus(jobId, 'translating');
          const khmerText = await translateToKhmer(transcription.text);
          console.log('Translation complete.');

          // Step 4 — TTS
          sendStatus(jobId, 'generating_audio');
          const khmerAudioPath = await textToSpeechKhmer(khmerText, jobId);
          console.log('Khmer audio ready.');

          // Step 5 — Merge
          sendStatus(jobId, 'merging');
          const dubbedVideoPath = await mergeAudioWithVideo(
            videoPath,
            khmerAudioPath,
            jobId,
          );
          console.log('Merge complete.');

          // // Cleanup
          fs.unlinkSync(audioPath);
          // fs.unlinkSync(khmerAudioPath)
          // fs.unlinkSync(videoPath)

          // Done — send transcript and video path
          sendStatus(jobId, 'completed', {
            transcript: {
              english: transcription.text,
              khmer: khmerText,
            },
            videoPath: dubbedVideoPath,
          });
        } catch (err) {
          console.error('Pipeline error:', err.message);
          sendStatus(jobId, 'error', { message: err.message });
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/regenerate', async (req, res) => {
  const { jobId, khmerText } = req.body;

  try {
    sendStatus(jobId, 'generating_audio');
    const khmerAudioPath = await textToSpeechKhmer(khmerText, jobId, true);
    console.log('Khmer audio ready.');

    sendStatus(jobId, 'merging');
    const videoPath = path.join(
      __dirname,
      '../../temp',
      `${jobId}_original.mp4`,
    );
    const dubbedVideoPath = await mergeAudioWithVideo(
      videoPath,
      khmerAudioPath,
      jobId,
    );
    console.log('Merge complete.');

    fs.unlinkSync(khmerAudioPath);

    sendStatus(jobId, 'completed', {
      khmer: khmerText,
      videoPath: dubbedVideoPath,
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Pipeline error:', err.message);
    sendStatus(jobId, 'error', { message: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
