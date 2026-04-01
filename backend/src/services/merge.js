require('dotenv').config()
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')

async function mergeAudioWithVideo(videoPath, audioPath, jobId) {
  console.log('audio path---', audioPath)
  console.log('video path', videoPath)
  console.log('jobId---', jobId)
  console.log('Merging Khmer audio with video...')

  // Add timestamp to bust cache on regenerate
  const outputPath = path.join(__dirname, '../../temp', `${jobId}_dubbed_${Date.now()}.mp4`)

  // Delete previous dubbed file if exists
  const tempDir = path.join(__dirname, '../../temp')
  fs.readdirSync(tempDir)
    .filter(f => f.startsWith(`${jobId}_dubbed`))
    .forEach(f => fs.unlinkSync(path.join(tempDir, f)))

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        '-map 0:v',
        '-map 1:a',
        '-c:v copy',
        '-shortest'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('Video merge complete:', outputPath)
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('ffmpeg error:', err.message)
        reject(err)
      })
      .run()
  })
}

module.exports = { mergeAudioWithVideo }