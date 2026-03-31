const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const dubRoutes = require('./routes/dub')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check — always have this
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Khmer Dub API is running' })
})

// Dub routes
app.use('/api/dub', dubRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})