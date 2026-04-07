require('dotenv').config()

const bcrypt = require('bcrypt')
const cors = require('cors')
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
        console.error('Erro ao conectar ao banco de dados:', err.stack)
        return
    }
    console.log('Conexão bem-sucedida ao banco de dados com o ID: ', connection.threadId)
})

app.post('/tutor', (req, res) => {
    const { nome, email, senha } = req.body;
    // 1. Busca no banco se já tem alguém com esse e-mail
    connection.promise().query('SELECT * FROM tb_tutor WHERE email = ?', [email])
        .then(([rows]) => {
            if (rows.length > 0) {
                // Se achou, a gente aborta a missão e manda pro catch
                return Promise.reject("Este e-mail já está cadastrado.")
            }
            // 2. Se o e-mail tá livre, fazemos o hash da senha
            return bcrypt.hash(senha, 10)
        })
        .then((hasheada) => {
            // 3. Com a senha hasheada, inserimos no banco
            const insert = 'INSERT INTO tb_tutor (nome, email, senha) VALUES (?, ?, ?)'
            return connection.promise().query(insert, [nome, email, hasheada])
        })
        .then(() => {
            res.json("Da um select no banco pra ter certeza")
        })
        .catch((erro) => {
            // Se o erro veio do Promise.reject lá de cima, mandamos a mensagem bonitinha
            res.json(erro)
        })
})

app.post('/login', (req, res) => {
    const email = req.body.email
    const senha = req.body.senha
    const user = 'SELECT * FROM tb_tutor WHERE email = ?'
    connection.query(user, [email], async (err, results, fields) => {
        if (err) {
            return res.json("Erro interno no login")
        }
        if (results.length === 0) {
            return res.json("Usuário não encontrado")
        }
        const compuse = results[0]
        const senhaIgual = await bcrypt.compare(senha, compuse.senha)
        if (!senhaIgual) {
            return res.json("senha inválida")
        }
        return res.json({
            mensagem: "Login realizado com sucesso",
            codigo_tutor: compuse.codigo_tutor,
            nome: compuse.nome,
            email: compuse.email,
        })
    })
})

app.put('/tutor/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { nome, email } = req.body
        const checkEmailQuery = 'SELECT * FROM tb_tutor WHERE email = ? AND codigo_tutor != ?'
        const [rows] = await connection.promise().query(checkEmailQuery, [email, id])

        if (rows.length > 0) {
            return res.json("Este e-mail já está em uso.")
        }

        const updateQuery = 'UPDATE tb_tutor SET nome = ?, email = ? WHERE codigo_tutor = ?'
        const [results] = await connection.promise().query(updateQuery, [nome, email, id])
        if (results.affectedRows === 0) {
            return res.json("Tutor não encontrado.")
        }
        res.json("Dados atualizados com sucesso!")
    } catch (erro) {
        console.error('Erro ao atualizar:', erro)
    }
})


app.delete('/tutor/:id', (req, res) => {
    // Pega o ID que vem na URL
    const id = req.params.id
    const deleteQuery = 'DELETE FROM tb_tutor WHERE codigo_tutor = ?'
    connection.query(deleteQuery, [id], (err, results) => {
        if (err) {
            return res.json("Erro ao deletar tutor")
        }
        // Verifica se o ID existe no banco antes de deletar
        if (results.affectedRows === 0) {
            return res.json("Tutor não encontrado")
        }
        res.json("Tutor deletado com sucesso!")
    })
})

app.get('/usuario/:email', (req, res) => {
    const email = req.params.email
    const query = 'SELECT codigo_tutor, nome, email FROM tb_tutor WHERE email = ?'
    connection.query(query, [email], (err, results) => {
        if (err) {
            return res.json({ erro: "Erro ao buscar usuário" })
        }
        if (results.length === 0) {
            return res.json({ erro: "Usuário não encontrado" })
        }
        res.json(results[0])
    })
})


app.post('/pet', async (req, res) => {
    try {
        const { nome, especie, peso, porte, codigo_tutor } = req.body

        const insertQuery = 'INSERT INTO tb_pet (nome, especie, peso, porte, codigo_tutor) VALUES (?, ?, ?, ?, ?)'

        await connection.promise().query(insertQuery, [nome, especie, peso, porte, codigo_tutor])

        res.json({ mensagem: "Pet cadastrado com sucesso!" })
    } catch (erro) {
        console.error('Erro ao cadastrar pet:', erro)
        res.json({ error: "Erro interno ao cadastrar o pet." })
    }
})

app.get('/pets/:codigo_tutor', async (req, res) => {
    try {
        // Pegamos o ID do tutor pela URL
        const codigo_tutor = req.params.codigo_tutor;
        const selectQuery = 'SELECT * FROM tb_pet WHERE codigo_tutor = ?';
        const [rows] = await connection.promise().query(selectQuery, [codigo_tutor]);
        // Devolvemos a lista de pets para o React Native (mesmo que seja uma lista vazia se ele não tiver nenhum)
        res.json(rows);
    } catch (erro) {
        console.error('Erro ao buscar pets:', erro);
        res.json({ error: "Erro interno ao buscar os pets." });
    }
});

app.get('/hello', (req, res) => {
    res.send('Olá Mundo')
})

const port = 3000
app.listen(port, () => {
    console.log(`Hello. Porta ${port}`)
})