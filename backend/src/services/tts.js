require('dotenv').config()
const textToSpeech = require('@google-cloud/text-to-speech')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const client = new textToSpeech.TextToSpeechClient({
  apiKey: process.env.GOOGLE_TTS_API_KEY
})

function chunkText(text, maxBytes = 4500) {
  const sentences = text.split(/[។\.!?]+/).filter(s => s.trim())
  const chunks = []
  let current = ''

  for (const sentence of sentences) {
    const candidate = current ? current + '។ ' + sentence : sentence
    if (Buffer.byteLength(candidate, 'utf8') > maxBytes) {
      if (current) chunks.push(current.trim())
      current = sentence
    } else {
      current = candidate
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

async function synthesizeChunk(text, outputPath) {
  const request = {
    input: { text },
    voice: {
      languageCode: 'km-KH',
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  }

  const [response] = await client.synthesizeSpeech(request)
  fs.writeFileSync(outputPath, response.audioContent, 'binary')
}

async function mergeAudioChunks(chunkPaths, outputPath) {
  return new Promise((resolve, reject) => {
    const listFile = outputPath + '_list.txt'
    const content = chunkPaths.map(p => `file '${p}'`).join('\n')
    fs.writeFileSync(listFile, content)

    exec(
      `ffmpeg -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`,
      (error) => {
        fs.unlinkSync(listFile)
        chunkPaths.forEach(p => fs.unlinkSync(p))
        if (error) reject(error)
        else resolve(outputPath)
      }
    )
  })
}

async function textToSpeechKhmer(khmerText, jobId) {
  console.log('Sending Khmer text to Google TTS...')

  const chunks = chunkText(khmerText)
  console.log(`Split into ${chunks.length} chunks`)

  if (chunks.length === 1) {
    const outputPath = path.join(__dirname, '../../temp', `${jobId}_khmer.mp3`)
    await synthesizeChunk(chunks[0], outputPath)
    console.log('Khmer audio generated.')
    return outputPath
  }

  // Generate audio for each chunk
  const chunkPaths = []
  for (let i = 0; i < chunks.length; i++) {
    const chunkPath = path.join(__dirname, '../../temp', `${jobId}_chunk_${i}.mp3`)
    await synthesizeChunk(chunks[i], chunkPath)
    chunkPaths.push(chunkPath)
    console.log(`Chunk ${i + 1}/${chunks.length} done`)
  }

  // Merge all chunks into one file
  const outputPath = path.join(__dirname, '../../temp', `${jobId}_khmer.mp3`)
  await mergeAudioChunks(chunkPaths, outputPath)

  console.log('Khmer audio generated:', outputPath)
  return outputPath
}

module.exports = { textToSpeechKhmer }