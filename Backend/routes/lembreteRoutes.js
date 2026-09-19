const express = require("express");
const router = express.Router();
const lembreteController = require("../controllers/lembreteController");

router.get(
    "/lembretes/:codigo_tutor",
    lembreteController.listarLembretesDoTutor
);

router.post(
    "/lembrete",
    lembreteController.cadastrarLembrete
);

router.delete(
    "/lembrete/:codigo_lembrete",
    lembreteController.deletarLembrete
);

module.exports = router;