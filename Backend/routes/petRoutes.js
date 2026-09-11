const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');

router.post('/pet', petController.cadastrarPet)
router.get('/pets/:codigo_tutor', petController.listarPetsDoTutor)
router.get('/pet/:codigo_pet', petController.buscarPetPorId)
router.put('/pet/:codigo_pet', petController.atualizarPet);
router.delete('/pet/:codigo_pet', petController.deletarPet);
router.get('/pet/:codigo_pet/vacinas', petController.listarVacinasDoPet);
router.post('/vacina', petController.cadastrarVacina);
router.post('/medicamento', petController.cadastrarMedicamento);

module.exports = router;