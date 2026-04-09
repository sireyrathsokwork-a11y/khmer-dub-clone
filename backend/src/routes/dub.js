require('dotenv').config();
const express = require('express');
const router = express.Router();
const { execFile } = require('child_process'); // NOT exec — never spawns a shell
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { transcribeAudio } = require('../services/transcribe');
const { translateToKhmer } = require('../services/translate');
const { textToSpeechKhmer } = require('../services/tts');
const { mergeAudioWithVideo } = require('../services/merge');

const execFileAsync = promisify(execFile);

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMP_DIR = path.resolve(__dirname, '../../temp');
const NODE_PATH = process.env.YTDLP_NODE_PATH || '';
const YTDLP_JS_RUNTIME = process.env.YTDLP_JS_RUNTIME || 'node';
const COOKIES_PATH = process.env.YTDLP_COOKIES_PATH
  ? path.resolve(process.env.YTDLP_COOKIES_PATH)
  : path.resolve(__dirname, '../../config/cookies.txt');
const YT_DLP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const JOB_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_YOUTUBE_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'm.youtube.com',
  'youtu.be',
]);

// SSE client registry: jobId → res
const clients = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate a YouTube URL using proper URL parsing — not string includes().
 * Prevents bypass like: http://evil.com/?q=youtube.com
 */
function isValidYouTubeUrl(raw) {
  try {
    const { hostname } = new URL(raw);
    return VALID_YOUTUBE_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

/**
 * Validate a jobId is a real UUIDv4 before using it in paths or Map lookups.
 * Prevents path traversal via jobId like: ../../etc/passwd
 */
function isValidJobId(id) {
  return typeof id === 'string' && JOB_ID_PATTERN.test(id);
}

/**
 * Resolve a filename inside TEMP_DIR and verify it hasn't escaped via traversal.
 * Always call this before passing any path derived from user input to the FS.
 */
function safeTempPath(filename) {
  const resolved = path.resolve(TEMP_DIR, filename);
  if (!resolved.startsWith(TEMP_DIR + path.sep)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}

/**
 * Push an SSE event to the client listening on jobId.
 */
function sendStatus(jobId, status, data = {}) {
  const client = clients.get(jobId);
  if (client) {
    client.write(`data: ${JSON.stringify({ status, ...data })}\n\n`);
  }
}

/**
 * Delete files silently — best-effort, never throws.
 * Always called in finally blocks so failures don't suppress real errors.
 */
function cleanup(...filePaths) {
  for (const fp of filePaths) {
    fs.unlink(fp, () => {});
  }
}

/**
 * Run yt-dlp with an explicit args array — execFile never touches a shell,
 * so user-supplied URLs cannot inject shell commands regardless of content.
 */
async function ytDlp(args) {
  return execFileAsync('yt-dlp', args, {
    timeout: 120_000, // 2-minute hard cap per download
    maxBuffer: 10 * 1024 * 1024,
  });
}

function getYtDlpBaseArgs() {
  const args = [
    '--user-agent',
    YT_DLP_USER_AGENT,
    '--socket-timeout',
    '30',
    '--retries',
    '3',
    '--no-playlist',
  ];

  // EJS helps with YouTube bot-challenges on newer yt-dlp flows.
  if (NODE_PATH) {
    args.push(
      '--js-runtimes',
      `${YTDLP_JS_RUNTIME}:${NODE_PATH}`,
      '--remote-components',
      'ejs:github',
    );
  } else {
    args.push('--js-runtimes', YTDLP_JS_RUNTIME, '--remote-components', 'ejs:github');
  }

  // Cookies are optional for local/dev runs. Avoid write-back failures.
  if (fs.existsSync(COOKIES_PATH)) {
    args.push('--cookies', COOKIES_PATH);
  }

  return args;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/dub/video/:jobId
router.get('/video/:jobId', (req, res) => {
  const { jobId } = req.params;

  if (!isValidJobId(jobId)) {
    return res.status(400).json({ error: 'Invalid jobId' });
  }

  let files;
  try {
    files = fs
      .readdirSync(TEMP_DIR)
      .filter((f) => f.startsWith(`${jobId}_dubbed`) && f.endsWith('.mp4'))
      .sort()
      .reverse();
  } catch (err) {
    console.error('Failed to read temp dir:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (files.length === 0) {
    return res.status(404).json({ error: 'Video not found' });
  }

  let filePath;
  try {
    filePath = safeTempPath(files[0]);
  } catch {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  res.sendFile(filePath);
});

// GET /api/dub/status/:jobId  (SSE — long-lived connection)
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;

  if (!isValidJobId(jobId)) {
    return res.status(400).json({ error: 'Invalid jobId' });
  }

  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  clients.set(jobId, res);
  req.on('close', () => clients.delete(jobId));
});

// POST /api/dub/process
router.post('/process', async (req, res) => {
  const { youtubeUrl, previousJobId } = req.body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!youtubeUrl || typeof youtubeUrl !== 'string') {
    return res.status(400).json({ error: 'youtubeUrl is required' });
  }
  if (!isValidYouTubeUrl(youtubeUrl)) {
    return res.status(400).json({ error: 'URL must be a valid YouTube link' });
  }

  // Clean up previous job's files if the client provided a previousJobId.
  // This is the correct time to delete — the user has moved on to a new URL.
  if (previousJobId && isValidJobId(previousJobId)) {
    const prevFiles = [
      path.join(TEMP_DIR, `${previousJobId}_original.mp3`),
      path.join(TEMP_DIR, `${previousJobId}_original.mp4`),
    ];
    // Also delete any dubbed output files from the previous job
    try {
      const dubbed = fs
        .readdirSync(TEMP_DIR)
        .filter(
          (f) => f.startsWith(`${previousJobId}_dubbed`) && f.endsWith('.mp4'),
        )
        .map((f) => path.join(TEMP_DIR, f));
      cleanup(...prevFiles, ...dubbed);
    } catch {
      cleanup(...prevFiles); // best-effort even if readdir fails
    }
  }

  // crypto.randomUUID() — unforgeable, collision-free, non-guessable
  const jobId = crypto.randomUUID();
  const audioPath = path.join(TEMP_DIR, `${jobId}_original.mp3`);
  const videoPath = path.join(TEMP_DIR, `${jobId}_original.mp4`);

  // Respond immediately so the client can open the SSE channel with the jobId
  res.json({ status: 'processing', jobId, message: 'Starting pipeline...' });

  // ── Pipeline (async, outside the request/response cycle) ─────────────────
  try {
    sendStatus(jobId, 'downloading', { message: 'Downloading audio...' });
    await ytDlp([
      '-x',
      '--audio-format',
      'mp3',
      ...getYtDlpBaseArgs(),
      '-o',
      audioPath,
      youtubeUrl,
    ]);

    sendStatus(jobId, 'downloading', { message: 'Downloading video...' });
    await ytDlp([
      '-f',
      'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
      ...getYtDlpBaseArgs(),
      '--merge-output-format',
      'mp4',
      '-o',
      videoPath,
      youtubeUrl,
    ]);

    sendStatus(jobId, 'transcribing', { message: 'Transcribing...' });
    const transcription = await transcribeAudio(audioPath);

    sendStatus(jobId, 'translating', { message: 'Translating to Khmer...' });
    const khmerText = await translateToKhmer(transcription.text);

    sendStatus(jobId, 'generating_audio', {
      message: 'Generating Khmer audio...',
    });
    const khmerAudioPath = await textToSpeechKhmer(khmerText, jobId);

    sendStatus(jobId, 'merging', { message: 'Merging audio and video...' });
    const dubbedVideoPath = await mergeAudioWithVideo(
      videoPath,
      khmerAudioPath,
      jobId,
    );

    sendStatus(jobId, 'completed', {
      transcript: { english: transcription.text, khmer: khmerText },
      videoPath: dubbedVideoPath,
    });
  } catch (err) {
    console.error(`[job ${jobId}] Pipeline failed:`, err.message);
    sendStatus(jobId, 'error', { message: err.message });
  } finally {
    // Audio is no longer needed after transcription — delete it now.
    // Video stays alive until the user submits a new URL (cleaned via previousJobId).
    cleanup(audioPath);
  }
});

// POST /api/dub/regenerate
router.post('/regenerate', async (req, res) => {
  const { jobId, khmerText } = req.body;

  // ── Input validation ──────────────────────────────────────────────────────
  if (!isValidJobId(jobId)) {
    return res.status(400).json({ error: 'Invalid jobId' });
  }
  if (
    !khmerText ||
    typeof khmerText !== 'string' ||
    khmerText.trim().length === 0
  ) {
    return res.status(400).json({ error: 'khmerText is required' });
  }

  // Confirm the source video actually exists before starting work
  const videoPath = path.join(TEMP_DIR, `${jobId}_original.mp4`);
  if (!fs.existsSync(videoPath)) {
    return res
      .status(404)
      .json({ error: 'Source video not found for this jobId' });
  }

  // Acknowledge the request — SSE will carry progress from here
  res.json({ status: 'ok' });

  let khmerAudioPath;
  try {
    sendStatus(jobId, 'generating_audio', {
      message: 'Regenerating Khmer audio...',
    });
    khmerAudioPath = await textToSpeechKhmer(khmerText, jobId, true);

    sendStatus(jobId, 'merging', { message: 'Merging...' });
    const dubbedVideoPath = await mergeAudioWithVideo(
      videoPath,
      khmerAudioPath,
      jobId,
    );

    sendStatus(jobId, 'completed', {
      khmer: khmerText,
      videoPath: dubbedVideoPath,
    });
  } catch (err) {
    console.error(`[job ${jobId}] Regenerate failed:`, err.message);
    sendStatus(jobId, 'error', { message: err.message });
    // Note: res.json() was already sent above — do NOT call res.status(500) here,
    // headers are gone. SSE 'error' event is the correct channel at this point.
  } finally {   
    // Only delete the TTS audio — the source video must stay alive for
    // further regeneration calls. It gets cleaned up when the user
    // submits a new YouTube URL (via previousJobId in /process).
    if (khmerAudioPath) cleanup(khmerAudioPath);
  }
});

module.exports = router;
