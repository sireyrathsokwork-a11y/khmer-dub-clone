require('dotenv').config()
const Groq = require('groq-sdk')
const fs = require('fs')
const { File } = require('node:buffer')

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

async function transcribeAudio(audioFilePath) {
    console.log('Sending audio to Whisper...')

    const audioBuffer = fs.readFileSync(audioFilePath)
    const audioFile = new File([audioBuffer], require('path').basename(audioFilePath))

    const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-large-v3',
        response_format: 'verbose_json', // gives us timestamps
        language: 'en'
    })

    console.log('Transcription complete.')
    return transcription
}

module.exports = { transcribeAudio }