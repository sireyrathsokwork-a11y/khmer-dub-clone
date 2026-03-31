require('dotenv').config()
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

async function mergeAudioWithVideo(videoPath, audioPath, jobId) {
    console.log('Merging Khmer audio with video...')

    const outputPath = path.join(__dirname, '../../temp', `${jobId}_dubbed.mp4`)

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .outputOptions([
                '-map 0:v',    // take video from first input
                '-map 1:a',    // take audio from second input
                '-c:v copy',   // copy video stream, no re-encoding
                '-shortest'    // end when shortest stream ends
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