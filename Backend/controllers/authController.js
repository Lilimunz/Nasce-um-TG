const db = require('./db')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.fazerLogin = async (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;
    const userQuery = 'SELECT * FROM tb_tutor WHERE email = ?';

    try {
        const [results] = await db.query(userQuery, [email])

        if (results.length === 0) {
            return res.json("Usuário não encontrado")
        }

        const compuse = results[0];
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
    } catch (err) {
        console.error(err);
        return res.json("Erro interno no login")
    }
}

exports.cadastrarTutor = async (req, res) => {
    const { nome, email, senha } = req.body
    try {
        const [rows] = await db.query('SELECT * FROM tb_tutor WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.json("Este e-mail já está cadastrado.")
        }

        const hasheada = await bcrypt.hash(senha, 10);
        const insert = 'INSERT INTO tb_tutor (nome, email, senha) VALUES (?, ?, ?)';
        await db.query(insert, [nome, email, hasheada])

        res.json("Da um select no banco pra ter certeza")
    } catch (erro) {
        console.error('Erro no cadastro:', erro)
        res.json(erro)
    }
}

exports.solicitarRecuperacao = async (req, res) => {
    try {
        const { email } = req.body;
        const [tutor] = await db.query('SELECT * FROM tb_tutor WHERE email = ?', [email]);

        if (tutor.length === 0) return res.json({ erro: "E-mail não encontrado." })

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracao = new Date(Date.now() + 15 * 60 * 1000);

        await db.query(
            'UPDATE tb_tutor SET token_recuperacao = ?, token_expiracao = ? WHERE email = ?',
            [codigo, expiracao, email]
        );

        await transporter.sendMail({
            from: '"Equipe Guia Pet" <naoresponda@guiapet.com>',
            to: email,
            subject: "Recuperação de Senha",
            text: `Olá! Seu código de recuperação é: ${codigo}. Ele é válido por 15 minutos.`
        });

        res.json({ mensagem: "Código enviado com sucesso!" })
    } catch (erro) {
        console.error("Erro no esqueci-senha:", erro)
        res.json({ erro: "Erro ao enviar o e-mail." })
    }
}

exports.redefinirSenha = async (req, res) => {
    try {
        const { email, codigo, novaSenha } = req.body;
        const [tutorRows] = await db.query('SELECT * FROM tb_tutor WHERE email = ?', [email]);

        if (tutorRows.length === 0) return res.json({ erro: "Tutor não encontrado." })
        const tutor = tutorRows[0]

        if (tutor.token_recuperacao !== codigo) return res.json({ erro: "Código inválido." })
        if (new Date() > new Date(tutor.token_expiracao)) return res.json({ erro: "Código expirado. Solicite um novo." })
        const senhaHasheada = await bcrypt.hash(novaSenha, 10)
        await db.query(
            'UPDATE tb_tutor SET senha = ?, token_recuperacao = NULL, token_expiracao = NULL WHERE email = ?',
            [senhaHasheada, email]
        );
        res.json({ mensagem: "Senha redefinida com sucesso!" })
    } catch (erro) {
        console.error("Erro no redefinir-senha:", erro)
        res.json({ erro: "Erro ao redefinir a senha." })
    }
}

exports.loginGoogle = async (req, res) => {
    try {
        // O front end vai nos mandar o email e o nome direto do Google
        const { email, nome } = req.body

        if (!email) {
            return res.json("E-mail não fornecido pelo Google.")
        }

        // 1. Verifica se o usuário já existe no banco
        const [tutorExistente] = await db.query('SELECT * FROM tb_tutor WHERE email = ?', [email]);

        if (tutorExistente.length > 0) {
            const compuse = tutorExistente[0]
            // Usuário já existe, devolvemos os dados para o login
            return res.json({
                mensagem: "Login via Google realizado com sucesso",
                codigo_tutor: compuse.codigo_tutor,
                nome: compuse.nome,
                email: compuse.email,
                tipo_login: compuse.tipo_login
            })
        }
        // 2. Se não existe, vamos criar a conta dele agora mesmo (sem senha)
        const insertQuery = 'INSERT INTO tb_tutor (nome, email, tipo_login) VALUES (?, ?, ?)';
        const [novoTutor] = await db.query(insertQuery, [nome, email, 'google'])

        return res.json({
            mensagem: "Cadastro via Google realizado com sucesso",
            codigo_tutor: novoTutor.insertId,
            nome: nome,
            email: email,
            tipo_login: 'google'
        });

    } catch (erro) {
        console.error("Erro no login com Google:", erro)
        return res.json("Erro interno no login com Google")
    }
};