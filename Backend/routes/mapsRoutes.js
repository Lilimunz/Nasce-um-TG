const express = require("express");
const router = express.Router();
const mapsController = require("../controllers/mapsController");

router.get("/hospitais", mapsController.buscarHospitais);

router.get(
    "/hospitais/detalhes/:place_id",
    mapsController.detalhesHospital
);

router.get(
    "/geocode",
    mapsController.geocodificarEndereco
);

module.exports = router;