require('dotenv').config()
const textToSpeech = require('@google-cloud/text-to-speech')
const fs = require('fs')
const path = require('path')

const client = new textToSpeech.TextToSpeechClient({
    apiKey: process.env.GOOGLE_TTS_API_KEY
})

async function textToSpeechKhmer(khmerText, jobId) {
    console.log('Sending Khmer text to Google TTS...')

    const request = {
        input: { text: khmerText },
        voice: {
            languageCode: 'km-KH',
            ssmlGender: 'FEMALE'
        },
        audioConfig: {
            audioEncoding: 'MP3'
        }
    }

    const [response] = await client.synthesizeSpeech(request)

    const outputPath = path.join(__dirname, '../../temp', `${jobId}_khmer.mp3`)
    fs.writeFileSync(outputPath, response.audioContent, 'binary')

    console.log('Khmer audio generated:', outputPath)
    return outputPath
}

module.exports = { textToSpeechKhmer }
