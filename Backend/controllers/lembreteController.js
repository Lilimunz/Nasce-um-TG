const db = require("./db");

const formatarLembrete = (row) => ({
    codigo_lembrete: row.codigo_lembrete,
    codigo_pet: row.codigo_pet,
    pet_nome: row.pet_nome,
    categoria: row.categoria,
    observacao: row.observacao || "",
    data: row.data_lembrete,
    horario: String(row.horario).slice(0, 5),
});

exports.listarLembretesDoTutor = async (req, res) => {
    const codigoTutor = Number(req.params.codigo_tutor);

    if (!Number.isInteger(codigoTutor)) {
        return res.json({ erro: "codigo_tutor invalido" });
    }

    try {
        const [rows] = await db.query(
            `
            SELECT
                l.codigo_lembrete,
                l.codigo_pet,
                p.nome AS pet_nome,
                l.categoria,
                l.observacao,
                DATE_FORMAT(l.data_lembrete, '%Y-%m-%d') AS data_lembrete,
                TIME_FORMAT(l.horario, '%H:%i') AS horario
            FROM tb_lembrete l
            INNER JOIN tb_pet p
                ON p.codigo_pet = l.codigo_pet
            WHERE p.codigo_tutor = ?
            ORDER BY l.data_lembrete ASC, l.horario ASC
            `,
            [codigoTutor]
        );

        return res.json(rows.map(formatarLembrete));
    } catch (erro) {
        console.error("Erro ao listar lembretes:", erro);
        return res.json({ erro: "Erro ao listar lembretes" });
    }
};

exports.cadastrarLembrete = async (req, res) => {
    const {
        codigo_pet,
        categoria,
        observacao,
        data,
        horario,
    } = req.body;

    const codigoPet = Number(codigo_pet);

    if (
        !Number.isInteger(codigoPet) ||
        !categoria ||
        !data ||
        !horario
    ) {
        return res.json({
            erro: "codigo_pet, categoria, data e horario sao obrigatorios",
        });
    }

    try {
        const [petRows] = await db.query(
            "SELECT codigo_pet FROM tb_pet WHERE codigo_pet = ?",
            [codigoPet]
        );

        if (petRows.length === 0) {
            return res.json({ erro: "Pet nao encontrado" });
        }

        const [result] = await db.query(
            `
            INSERT INTO tb_lembrete
                (codigo_pet, categoria, observacao, data_lembrete, horario)
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                codigoPet,
                categoria,
                observacao || null,
                data,
                horario,
            ]
        );

        return res.json({
            mensagem: "Lembrete cadastrado com sucesso!",
            codigo_lembrete: result.insertId,
        });
    } catch (erro) {
        console.error("Erro ao cadastrar lembrete:", erro);
        return res.json({ erro: "Erro ao cadastrar lembrete" });
    }
};

exports.deletarLembrete = async (req, res) => {
    const codigoLembrete = Number(req.params.codigo_lembrete);

    if (!Number.isInteger(codigoLembrete)) {
        return res.json({ erro: "codigo_lembrete invalido" });
    }

    try {
        const [result] = await db.query(
            "DELETE FROM tb_lembrete WHERE codigo_lembrete = ?",
            [codigoLembrete]
        );

        if (result.affectedRows === 0) {
            return res.json({ erro: "Lembrete nao encontrado" });
        }

        return res.json({
            mensagem: "Lembrete excluido com sucesso!",
        });
    } catch (erro) {
        console.error("Erro ao excluir lembrete:", erro);
        return res.json({ erro: "Erro ao excluir lembrete" });
    }
};