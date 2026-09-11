const db = require('./db');

exports.atualizarTutor = async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, email } = req.body
        const checkEmailQuery = 'SELECT * FROM tb_tutor WHERE email = ? AND codigo_tutor != ?';
        const [rows] = await db.query(checkEmailQuery, [email, id])

        if (rows.length > 0) {
            return res.json("Este e-mail já está em uso.")
        }

        const updateQuery = 'UPDATE tb_tutor SET nome = ?, email = ? WHERE codigo_tutor = ?';
        const [results] = await db.query(updateQuery, [nome, email, id])
        if (results.affectedRows === 0) {
            return res.json("Tutor não encontrado.")
        }
        res.json("Dados atualizados com sucesso!")
    } catch (erro) {
        console.error('Erro ao atualizar:', erro)
    }
};

exports.deletarTutor = async (req, res) => {
    const codigoTutor = Number(req.params.id);
    if (!Number.isInteger(codigoTutor)) return res.json({ erro: "codigo_tutor invalido" })

    // Pegamos a conexão direta do db (já que db = pool.promise())
    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()

        const [petsRows] = await conn.query('SELECT codigo_pet FROM tb_pet WHERE codigo_tutor = ?', [codigoTutor]);
        const petIds = petsRows.map((row) => row.codigo_pet)

        if (petIds.length > 0) {
            const placeholders = petIds.map(() => '?').join(',');
            await conn.query(`DELETE FROM tb_vacina WHERE codigo_pet IN (${placeholders})`, petIds);
            const [medRows] = await conn.query(`SELECT DISTINCT codigo_medicamento FROM tb_pet_medicamento WHERE codigo_pet IN (${placeholders})`, petIds);
            const medIds = medRows.map((row) => row.codigo_medicamento)
            await conn.query(`DELETE FROM tb_pet_medicamento WHERE codigo_pet IN (${placeholders})`, petIds);
            await conn.query('DELETE FROM tb_pet WHERE codigo_tutor = ?', [codigoTutor]);

            if (medIds.length > 0) {
                const medPlaceholders = medIds.map(() => '?').join(',');
                await conn.query(`DELETE FROM tb_medicamento WHERE codigo_medicamento IN (${medPlaceholders})`, medIds);
            }
        } else {
            await conn.query('DELETE FROM tb_pet WHERE codigo_tutor = ?', [codigoTutor]);
        }
        const [result] = await conn.query('DELETE FROM tb_tutor WHERE codigo_tutor = ?', [codigoTutor]);

        if (result.affectedRows === 0) {
            await conn.rollback()
            conn.release()
            return res.json({ erro: "Tutor nao encontrado" })
        }
        await conn.commit()
        conn.release()
        res.json({ mensagem: "Tutor deletado com sucesso!" });
    } catch (erro) {
        await conn.rollback()
        conn.release()
        console.error('Erro ao deletar tutor:', erro)
        res.json({ erro: "Erro ao deletar tutor" })
    }
};

exports.buscarTutorPorEmail = async (req, res) => {
    try {
        const email = req.params.email
        const [results] = await db.query('SELECT codigo_tutor, nome, email FROM tb_tutor WHERE email = ?', [email]);
        if (results.length === 0) return res.json({ erro: "Usuário não encontrado" })
        res.json(results[0]);
    } catch (err) {
        res.json({ erro: "Erro ao buscar usuário" })
    }
};

exports.buscarTutorPorId = async (req, res) => {
    try {
        const codigo_tutor = Number(req.params.id)
        if (!Number.isInteger(codigo_tutor)) return res.json({ erro: "codigo_tutor invalido" });

        const [rows] = await db.query('SELECT codigo_tutor, nome, email FROM tb_tutor WHERE codigo_tutor = ?', [codigo_tutor]);
        if (rows.length === 0) return res.json({ erro: "Tutor nao encontrado" })
        res.json(rows[0])
    } catch (erro) {
        console.error('Erro ao buscar tutor:', erro)
        res.json({ erro: "Erro ao buscar tutor" })
    }
};

exports.buscarPerfil = async (req, res) => {
    try {
        const codigo_tutor = req.params.codigo_tutor
        const [tutorRows] = await db.query('SELECT codigo_tutor, nome, email FROM tb_tutor WHERE codigo_tutor = ?', [codigo_tutor]);
        if (tutorRows.length === 0) return res.json({ erro: "Tutor não encontrado" })
        const [petsRows] = await db.query('SELECT * FROM tb_pet WHERE codigo_tutor = ?', [codigo_tutor]);
        res.json({ tutor: tutorRows[0], pets: petsRows });
    } catch (erro) {
        console.error('Erro ao buscar perfil:', erro)
        res.json({ erro: "Erro ao buscar perfil do tutor" })
    }
};