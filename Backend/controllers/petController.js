const db = require('./db');

exports.cadastrarPet = async (req, res) => {
    try {
        const { nome, especie, peso, porte, codigo_tutor } = req.body;
        const insertQuery = 'INSERT INTO tb_pet (nome, especie, peso, porte, codigo_tutor) VALUES (?, ?, ?, ?, ?)';
        await db.query(insertQuery, [nome, especie, peso, porte, codigo_tutor]);
        res.json({ mensagem: "Pet cadastrado com sucesso!" })
    } catch (erro) {
        console.error('Erro ao cadastrar pet:', erro)
        res.json({ error: "Erro interno ao cadastrar o pet." })
    }
}

exports.listarPetsDoTutor = async (req, res) => {
    try {
        const codigo_tutor = req.params.codigo_tutor
        const [rows] = await db.query('SELECT * FROM tb_pet WHERE codigo_tutor = ?', [codigo_tutor]);
        res.json(rows)
    } catch (erro) {
        console.error('Erro ao buscar pets:', erro)
        res.json({ error: "Erro interno ao buscar os pets." })
    }
}

exports.buscarPetPorId = async (req, res) => {
    try {
        const codigo_pet = req.params.codigo_pet;
        const [rows] = await db.query('SELECT * FROM tb_pet WHERE codigo_pet = ?', [codigo_pet]);
        if (rows.length === 0) return res.json({ erro: "Pet não encontrado" });
        res.json(rows[0])
    } catch (erro) {
        console.error('Erro ao buscar pet:', erro)
        res.json({ erro: "Erro ao buscar pet" })
    }
}

exports.atualizarPet = async (req, res) => {
    try {
        const codigoPet = Number(req.params.codigo_pet);
        const { nome, idade, especie, peso, data_nascimento, porte, raca, condicao_especial, quantidade_racao } = req.body

        if (!Number.isInteger(codigoPet)) return res.json({ erro: "codigo_pet invalido" })
        if (!nome || !especie) return res.json({ erro: "nome e especie sao obrigatorios" })
        const updateQuery = `
            UPDATE tb_pet
            SET nome = ?, idade = ?, especie = ?, peso = ?, data_nascimento = ?, porte = ?, raca = ?, condicao_especial = ?, quantidade_racao = ?
            WHERE codigo_pet = ?
        `;
        const [result] = await db.query(updateQuery, [
            nome, idade ?? null, especie, peso ?? null, data_nascimento ?? null, porte ?? null, raca ?? null, condicao_especial ?? null, quantidade_racao ?? null, codigoPet,
        ])

        if (result.affectedRows === 0) return res.json({ erro: "Pet nao encontrado" })
        res.json({ mensagem: "Pet atualizado com sucesso!" })
    } catch (erro) {
        console.error('Erro ao atualizar pet:', erro)
        res.json({ erro: "Erro ao atualizar pet" })
    }
}

exports.deletarPet = async (req, res) => {
    const codigoPet = Number(req.params.codigo_pet);
    if (!Number.isInteger(codigoPet)) return res.json({ erro: "codigo_pet invalido" })

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction()
        await conn.query('DELETE FROM tb_vacina WHERE codigo_pet = ?', [codigoPet]);
        await conn.query('DELETE FROM tb_pet_medicamento WHERE codigo_pet = ?', [codigoPet]);

        const [result] = await conn.query('DELETE FROM tb_pet WHERE codigo_pet = ?', [codigoPet]);
        if (result.affectedRows === 0) {
            await conn.rollback()
            conn.release()
            return res.json({ erro: "Pet nao encontrado" });
        }
        await conn.commit()
        conn.release()
        res.json({ mensagem: "Pet excluido com sucesso!" })
    } catch (erro) {
        await conn.rollback()
        conn.release()
        console.error('Erro ao excluir pet:', erro)
        res.json({ erro: "Erro ao excluir pet" })
    }
}

exports.listarVacinasDoPet = async (req, res) => {
    try {
        const codigo_pet = req.params.codigo_pet
        const [rows] = await db.query('SELECT codigo_vacina, nome, tipo, data_aplicacao FROM tb_vacina WHERE codigo_pet = ? ORDER BY data_aplicacao DESC', [codigo_pet]);
        res.json(rows)
    } catch (erro) {
        console.error('Erro ao buscar vacinas:', erro)
        res.json({ erro: "Erro ao buscar vacinas" })
    }
}

exports.cadastrarVacina = async (req, res) => {
    try {
        const { codigo_pet, nome, tipo, data_aplicacao } = req.body
        if (!codigo_pet || !nome || !tipo || !data_aplicacao) return res.json({ erro: "Todos os campos são obrigatórios" })

        await db.query('INSERT INTO tb_vacina (codigo_pet, nome, tipo, data_aplicacao) VALUES (?, ?, ?, ?)', [codigo_pet, nome, tipo, data_aplicacao]);
        res.json({ mensagem: "Vacina cadastrada com sucesso!" })
    } catch (erro) {
        console.error('Erro ao cadastrar vacina:', erro)
        res.json({ erro: "Erro ao cadastrar vacina" })
    }
}

exports.cadastrarMedicamento = async (req, res) => {
    const { codigo_pet, nome, classificacao, validade, dosagem, frequencia } = req.body;
    if (!codigo_pet || !nome) return res.json({ erro: "codigo_pet e nome sao obrigatorios" })

    const codigoPet = Number(codigo_pet);
    if (!Number.isInteger(codigoPet)) return res.json({ erro: "codigo_pet invalido" })

    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()

        const [medResult] = await conn.query('INSERT INTO tb_medicamento (nome, classificacao, validade) VALUES (?, ?, ?)', [nome, classificacao || null, validade || null]);
        const codigo_medicamento = medResult.insertId;

        await conn.query('INSERT INTO tb_pet_medicamento (codigo_pet, codigo_medicamento, dosagem, frequencia) VALUES (?, ?, ?, ?)', [codigoPet, codigo_medicamento, dosagem || null, frequencia || null]);

        await conn.commit();
        conn.release();
        res.json({ mensagem: "Medicamento cadastrado com sucesso!", codigo_medicamento });
    } catch (erro) {
        await conn.rollback();
        conn.release();
        console.error('Erro ao cadastrar medicamento:', erro)
        res.json({ erro: "Erro ao cadastrar medicamento" })
    }
}