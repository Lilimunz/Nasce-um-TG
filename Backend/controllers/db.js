require('dotenv').config()
const mysql = require('mysql2')

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

connection.promise().getConnection()
    .then(conn => {
        console.log('Conexão com o banco bem-sucedida! ID:', conn.threadId);
        conn.release();
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco:', err.message);
    });

module.exports = connection.promise();

