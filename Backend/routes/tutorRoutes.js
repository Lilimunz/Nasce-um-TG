const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

router.put('/tutor/:id', tutorController.atualizarTutor);
router.delete('/tutor/:id', tutorController.deletarTutor);
router.get('/usuario/:email', tutorController.buscarTutorPorEmail);
router.get('/tutor/:id', tutorController.buscarTutorPorId);
router.get('/tutor/:codigo_tutor/perfil', tutorController.buscarPerfil);

module.exports = router;