require('dotenv').config()

const express = require('express')
const cors = require('cors')

// Rotas
const authRoutes = require('./routes/authRoutes')
const tutorRoutes = require('./routes/tutorRoutes')
const petRoutes = require('./routes/petRoutes')
const mapsRoutes = require('./routes/mapsRoutes')

const app = express()

app.use(express.json())
app.use(cors())

// Rotas Express
app.use('/', authRoutes)
app.use('/', tutorRoutes) 
app.use('/', petRoutes)
app.use('/', mapsRoutes)

app.get('/hello', (req, res) => {
    res.send('Olá Mundo')
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando organizado na porta ${PORT}! 🚀`);
});