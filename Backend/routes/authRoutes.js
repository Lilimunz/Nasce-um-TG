const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importamos login e cadastro


router.post('/login', authController.fazerLogin);
router.post('/login-google', authController.loginGoogle);
router.post('/tutor', authController.cadastrarTutor);
router.post('/esqueci-senha', authController.solicitarRecuperacao);
router.post('/redefinir-senha', authController.redefinirSenha);

module.exports = router;