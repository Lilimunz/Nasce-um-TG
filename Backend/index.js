require('dotenv').config()

const bcrypt = require('bcrypt')
const cors = require('cors')
const express = require('express')
const mysql = require('mysql2')
const app = express()
app.use(express.json())
app.use(cors())

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10, // Permite até 10 conexões simultâneas
    queueLimit: 0
});

// Testando se o Pool conseguiu se conectar
connection.getConnection((err, conn) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados pelo Pool:', err.stack);
        return;
    }
    conn.query("SET NAMES utf8mb4", (setErr) => {
        if (setErr) console.error('Erro ao configurar charset utf8mb4:', setErr);
    });
    console.log('Conexão via Pool bem-sucedida! ID: ', conn.threadId);
    conn.release(); // Libera a conexão de volta pro Pool
});

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


app.delete('/tutor/:id', async (req, res) => {
    const codigoTutor = Number(req.params.id)

    if (!Number.isInteger(codigoTutor)) {
        return res.json({ erro: "codigo_tutor invalido" })
    }

    // PEGA UMA CONEXÃO EMPRESTADA DO POOL
    const conn = await connection.promise().getConnection();
    
    try {
        await conn.beginTransaction()

        const [petsRows] = await conn.query(
            'SELECT codigo_pet FROM tb_pet WHERE codigo_tutor = ?',
            [codigoTutor]
        )
        const petIds = petsRows.map((row) => row.codigo_pet)

        if (petIds.length > 0) {
            const placeholders = petIds.map(() => '?').join(',')

            await conn.query(
                `DELETE FROM tb_vacina WHERE codigo_pet IN (${placeholders})`,
                petIds
            )

            const [medRows] = await conn.query(
                `SELECT DISTINCT codigo_medicamento FROM tb_pet_medicamento WHERE codigo_pet IN (${placeholders})`,
                petIds
            )
            const medIds = medRows.map((row) => row.codigo_medicamento)

            await conn.query(
                `DELETE FROM tb_pet_medicamento WHERE codigo_pet IN (${placeholders})`,
                petIds
            )
            await conn.query('DELETE FROM tb_pet WHERE codigo_tutor = ?', [codigoTutor])

            if (medIds.length > 0) {
                const medPlaceholders = medIds.map(() => '?').join(',')
                await conn.query(
                    `DELETE FROM tb_medicamento WHERE codigo_medicamento IN (${medPlaceholders})`,
                    medIds
                )
            }
        } else {
            await conn.query('DELETE FROM tb_pet WHERE codigo_tutor = ?', [codigoTutor])
        }

        const [result] = await conn.query(
            'DELETE FROM tb_tutor WHERE codigo_tutor = ?',
            [codigoTutor]
        )

        if (result.affectedRows === 0) {
            await conn.rollback()
            conn.release() // DEVOLVE
            return res.json({ erro: "Tutor nao encontrado" })
        }

        await conn.commit()
        conn.release() // DEVOLVE
        res.json({ mensagem: "Tutor deletado com sucesso!" })
    } catch (erro) {
        try {
            await conn.rollback()
        } catch (rollbackError) {
            console.error('Erro ao fazer rollback:', rollbackError)
        }
        conn.release() // DEVOLVE
        console.error('Erro ao deletar tutor:', erro)
        res.json({ erro: "Erro ao deletar tutor" })
    }
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

app.get('/tutor/:id', async (req, res) => {
    try {
        const codigo_tutor = Number(req.params.id)
        if (!Number.isInteger(codigo_tutor)) {
            return res.json({ erro: "codigo_tutor invalido" })
        }

        const query = 'SELECT codigo_tutor, nome, email FROM tb_tutor WHERE codigo_tutor = ?'
        const [rows] = await connection.promise().query(query, [codigo_tutor])

        if (rows.length === 0) {
            return res.json({ erro: "Tutor nao encontrado" })
        }

        res.json(rows[0])
    } catch (erro) {
        console.error('Erro ao buscar tutor:', erro)
        res.json({ erro: "Erro ao buscar tutor" })
    }
})

app.get('/tutor/:codigo_tutor/perfil', async (req, res) => {
    try {
        const codigo_tutor = req.params.codigo_tutor;
        
        // Buscar dados do tutor
        const [tutorRows] = await connection.promise().query(
            'SELECT codigo_tutor, nome, email FROM tb_tutor WHERE codigo_tutor = ?',
            [codigo_tutor]
        );
        
        if (tutorRows.length === 0) {
            return res.json({ erro: "Tutor não encontrado" });
        }
        
        // Buscar pets do tutor
        const [petsRows] = await connection.promise().query(
            'SELECT * FROM tb_pet WHERE codigo_tutor = ?',
            [codigo_tutor]
        );
        
        res.json({
            tutor: tutorRows[0],
            pets: petsRows
        });
    } catch (erro) {
        console.error('Erro ao buscar perfil:', erro);
        res.json({ erro: "Erro ao buscar perfil do tutor" });
    }
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

app.get('/pet/:codigo_pet', async (req, res) => {
    try {
        const codigo_pet = req.params.codigo_pet;
        const selectQuery = 'SELECT * FROM tb_pet WHERE codigo_pet = ?';
        const [rows] = await connection.promise().query(selectQuery, [codigo_pet]);
        
        if (rows.length === 0) {
            return res.json({ erro: "Pet não encontrado" });
        }
        
        res.json(rows[0]);
    } catch (erro) {
        console.error('Erro ao buscar pet:', erro);
        res.json({ erro: "Erro ao buscar pet" });
    }
});

app.put('/pet/:codigo_pet', async (req, res) => {
    try {
        const codigoPet = Number(req.params.codigo_pet);
        const {
            nome,
            idade,
            especie,
            peso,
            data_nascimento,
            porte,
            raca,
            condicao_especial,
            quantidade_racao,
        } = req.body;

        if (!Number.isInteger(codigoPet)) {
            return res.json({ erro: "codigo_pet invalido" });
        }

        if (!nome || !especie) {
            return res.json({ erro: "nome e especie sao obrigatorios" });
        }

        const updateQuery = `
            UPDATE tb_pet
            SET nome = ?,
                idade = ?,
                especie = ?,
                peso = ?,
                data_nascimento = ?,
                porte = ?,
                raca = ?,
                condicao_especial = ?,
                quantidade_racao = ?
            WHERE codigo_pet = ?
        `;

        const [result] = await connection.promise().query(updateQuery, [
            nome,
            idade ?? null,
            especie,
            peso ?? null,
            data_nascimento ?? null,
            porte ?? null,
            raca ?? null,
            condicao_especial ?? null,
            quantidade_racao ?? null,
            codigoPet,
        ]);

        if (result.affectedRows === 0) {
            return res.json({ erro: "Pet nao encontrado" });
        }

        res.json({ mensagem: "Pet atualizado com sucesso!" });
    } catch (erro) {
        console.error('Erro ao atualizar pet:', erro);
        res.json({ erro: "Erro ao atualizar pet" });
    }
});

app.get('/pet/:codigo_pet/vacinas', async (req, res) => {
    try {
        const codigo_pet = req.params.codigo_pet;
        const selectQuery = `
            SELECT codigo_vacina, nome, tipo, data_aplicacao
            FROM tb_vacina
            WHERE codigo_pet = ?
            ORDER BY data_aplicacao DESC
        `;
        const [rows] = await connection.promise().query(selectQuery, [codigo_pet]);

        res.json(rows);
    } catch (erro) {
        console.error('Erro ao buscar vacinas:', erro);
        res.json({ erro: "Erro ao buscar vacinas" });
    }
});

app.delete('/pet/:codigo_pet', async (req, res) => {
    const codigo_pet = req.params.codigo_pet;
    const codigoPet = Number(codigo_pet);

    if (!Number.isInteger(codigoPet)) {
        return res.json({ erro: "codigo_pet invalido" });
    }

    // PEGA UMA CONEXÃO EMPRESTADA DO POOL
    const conn = await connection.promise().getConnection(); 
    
    try {
        await conn.beginTransaction();

        await conn.query('DELETE FROM tb_vacina WHERE codigo_pet = ?', [codigoPet]);
        await conn.query('DELETE FROM tb_pet_medicamento WHERE codigo_pet = ?', [codigoPet]);

        const [result] = await conn.query('DELETE FROM tb_pet WHERE codigo_pet = ?', [codigoPet]);
        if (result.affectedRows === 0) {
            await conn.rollback();
            conn.release(); // DEVOLVE PRO POOL
            return res.json({ erro: "Pet nao encontrado" });
        }

        await conn.commit();
        conn.release(); // DEVOLVE PRO POOL NO SUCESSO
        res.json({ mensagem: "Pet excluido com sucesso!" });
    } catch (erro) {
        try {
            await conn.rollback();
        } catch (rollbackError) {
            console.error('Erro ao fazer rollback:', rollbackError);
        }
        conn.release(); // DEVOLVE PRO POOL NO ERRO
        console.error('Erro ao excluir pet:', erro);
        res.json({ erro: "Erro ao excluir pet" });
    }
});

app.post('/vacina', async (req, res) => {
    try {
        const { codigo_pet, nome, tipo, data_aplicacao } = req.body;
        
        if (!codigo_pet || !nome || !tipo || !data_aplicacao) {
            return res.json({ erro: "Todos os campos são obrigatórios" });
        }
        
        const insertQuery = 'INSERT INTO tb_vacina (codigo_pet, nome, tipo, data_aplicacao) VALUES (?, ?, ?, ?)';
        await connection.promise().query(insertQuery, [codigo_pet, nome, tipo, data_aplicacao]);
        
        res.json({ mensagem: "Vacina cadastrada com sucesso!" });
    } catch (erro) {
        console.error('Erro ao cadastrar vacina:', erro);
        res.json({ erro: "Erro ao cadastrar vacina" });
    }
});

app.post('/medicamento', async (req, res) => {
    const { codigo_pet, nome, classificacao, validade, dosagem, frequencia } = req.body;

    if (!codigo_pet || !nome) {
        return res.json({ erro: "codigo_pet e nome sao obrigatorios" });
    }

    const codigoPet = Number(codigo_pet);
    if (!Number.isInteger(codigoPet)) {
        return res.json({ erro: "codigo_pet invalido" });
    }

    // PEGA UMA CONEXÃO EMPRESTADA DO POOL
    const conn = await connection.promise().getConnection();
    
    try {
        await conn.beginTransaction();

        const insertMedicamento =
            'INSERT INTO tb_medicamento (nome, classificacao, validade) VALUES (?, ?, ?)';
        const [medResult] = await conn.query(insertMedicamento, [
            nome,
            classificacao || null,
            validade || null,
        ]);

        const codigo_medicamento = medResult.insertId;

        const insertPetMedicamento =
            'INSERT INTO tb_pet_medicamento (codigo_pet, codigo_medicamento, dosagem, frequencia) VALUES (?, ?, ?, ?)';
        await conn.query(insertPetMedicamento, [
            codigoPet,
            codigo_medicamento,
            dosagem || null,
            frequencia || null,
        ]);

        await conn.commit();
        conn.release(); // DEVOLVE PRO POOL
        res.json({ mensagem: "Medicamento cadastrado com sucesso!", codigo_medicamento });
    } catch (erro) {
        try {
            await conn.rollback();
        } catch (rollbackError) {
            console.error('Erro ao fazer rollback:', rollbackError);
        }
        conn.release(); // DEVOLVE PRO POOL
        console.error('Erro ao cadastrar medicamento:', erro);
        res.json({ erro: "Erro ao cadastrar medicamento" });
    }
});

app.get('/hello', (req, res) => {
    res.send('Olá Mundo')
})

const port = 3000
app.listen(port, () => {
    console.log(`Hello. Porta ${port}`)
})