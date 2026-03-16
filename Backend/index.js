require('dotenv').config()

const bcrypt = require('bcrypt')
const cors = require ('cors')
const express = require('express')
const mysql = require('mysql2')
const app = express()
app.use(express.json())
app.use(cors())

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
})

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados com o ID: ', connection.threadId);
});

app.post('/tutor', async (req, res) => {
    try {
        const nome = req.body.nome
        const email = req.body.email
        const senha = req.body.senha
        const hasheada = await bcrypt.hash(senha, 10)
        const insert = 'INSERT INTO tb_tutor (nome, email, senha) VALUES (?, ?, ?)'
        connection.query(insert, [nome, email, hasheada], (err, results, fields) => {
            console.log(results)
            console.log(fields)
            res.send('Da um select no banco pra ter certeza')
        })
    } catch (error) {
        console.log('Algo deu errado')
    }
})

app.post('/login', (req, res) => {
    const email = req.body.email
    const senha = req.body.senha
    const user = 'SELECT * FROM tb_tutor WHERE email = ?'
    connection.query(user, [email], async (err, results, fields) => {
        if (results.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }
        const compuse = results[0]
        const senhaIgual = await bcrypt.compare(senha, compuse.senha)
        if (!senhaIgual) {
            return res.status(401).json({ mensagem: "senha inválida" })
        }
        res.end()
    })
})

app.put('/tutor/:id', (req, res) => {
    // Pegamos o ID que vem na URL
    const id = req.params.id
    // Pegamos os novos dados que vêm do Front
    const { nome, email } = req.body;
    const updateQuery = 'UPDATE tb_tutor SET nome = ?, email = ? WHERE codigo_tutor = ?'
    connection.query(updateQuery, [nome, email, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar:', err)
            return res.json({ error: "Erro ao atualizar tutor" })
        }
        // Verifica se alguma linha foi realmente alterada
        if (results.affectedRows === 0) {
            return res.json({ error: "Tutor não encontrado" })
        }
        res.json({ mensagem: "Tutor atualizado com sucesso!" })
    })
})


app.delete('/tutor/:id', (req, res) => {
    // Pega o ID que vem na URL
    const id = req.params.id
    const deleteQuery = 'DELETE FROM tb_tutor WHERE codigo_tutor = ?'
    connection.query(deleteQuery, [id], (err, results) => {
        if (err) {
            console.error('Erro ao deletar:', err);
            return res.json({ error: "Erro ao deletar tutor" })
        }
        // Verifica se o ID existe no banco antes de deletar
        if (results.affectedRows === 0) {
            return res.json({ error: "Tutor não encontrado" })
        }
        res.json({ mensagem: "Tutor deletado com sucesso!" })
    })
})

app.get('/hello', (req, res) => {
    res.send('Olá Mundo')
})

const port = 3000
app.listen(port, () => {
    console.log(`Hello. Porta ${port}`)
})