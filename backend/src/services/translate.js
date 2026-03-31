require('dotenv').config()
const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
})

async function translateToKhmer(englishText) {
    console.log('Sending transcript to Claude for Khmer translation...')

    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
            {
                role: 'user',
                content: `You are a professional translator specializing in English to Khmer translation.

Translate the following English text to Khmer. 
- Keep the translation natural and conversational
- Preserve the tone and emotion of the original
- Return ONLY the Khmer translation, nothing else

English text:
${englishText}`
            }
        ]
    })

    const khmerText = message.content[0].text
    console.log('Translation complete.')
    return khmerText
}

module.exports = { translateToKhmer }