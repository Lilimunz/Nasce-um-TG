const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const PLACES_NEARBY_URL =
    "https://places.googleapis.com/v1/places:searchNearby";

const PLACES_FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.currentOpeningHours",
    "places.types",
].join(",");

exports.buscarHospitais = async (req, res) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({
                error: "Latitude e longitude são obrigatórias.",
            });
        }

        if (!GOOGLE_MAPS_API_KEY) {
            console.error("GOOGLE_MAPS_API_KEY não encontrada.");
            return res.status(500).json({
                error: "GOOGLE_MAPS_API_KEY não configurada no backend.",
            });
        }

        const response = await axios.post(
            PLACES_NEARBY_URL,
            {
                includedTypes: ["veterinary_care"],
                maxResultCount: 20,
                rankPreference: "DISTANCE",
                locationRestriction: {
                    circle: {
                        center: {
                            latitude: lat,
                            longitude: lng,
                        },
                        radius: 10000,
                    },
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                    "X-Goog-FieldMask": PLACES_FIELD_MASK,
                },
            }
        );


        return res.json(response.data);
    } catch (erro) {
        console.error(
            "Erro no Nearby Search:",
            erro.response?.status,
            erro.response?.data || erro.message
        );

        return res.status(500).json({
            error: "Erro ao consultar a Places API.",
            googleError: erro.response?.data || erro.message,
        });
    }
};

exports.detalhesHospital = async (req, res) => {
    try {
        const { place_id } = req.params;

        if (!place_id) {
            return res.status(400).json({
                error: "place_id é obrigatório.",
            });
        }

        const resourceName = place_id.startsWith("places/")
            ? place_id
            : `places/${place_id}`;

        const response = await axios.get(
            `https://places.googleapis.com/v1/${resourceName}`,
            {
                headers: {
                    "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                    "X-Goog-FieldMask": [
                        "id",
                        "displayName",
                        "formattedAddress",
                        "nationalPhoneNumber",
                        "internationalPhoneNumber",
                        "location",
                        "regularOpeningHours",
                        "types",
                    ].join(","),
                },
            }
        );

        return res.json(response.data);
    } catch (erro) {
        console.error(
            "Erro ao buscar detalhes do hospital:",
            erro.response?.data || erro.message
        );

        return res.status(500).json({
            error: "Erro ao consultar detalhes do local.",
            googleError: erro.response?.data || erro.message,
        });
    }
};

exports.geocodificarEndereco = async (req, res) => {
    try {
        const address = String(req.query.address || "").trim();

        if (!address) {
            return res.status(400).json({
                error: "O endereço é obrigatório.",
            });
        }

        const response = await axios.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            {
                params: {
                    address,
                    language: "pt-BR",
                    region: "br",
                    key: GOOGLE_MAPS_API_KEY,
                },
            }
        );

        const resultado = response.data.results?.[0];

        if (!resultado) {
            return res.status(404).json({
                error: "Endereço não encontrado.",
            });
        }

        return res.json({
            latitude: resultado.geometry.location.lat,
            longitude: resultado.geometry.location.lng,
            endereco: resultado.formatted_address,
            place_id: resultado.place_id,
        });
    } catch (erro) {
        console.error(
            "Erro no Geocoding:",
            erro.response?.data || erro.message
        );

        return res.status(500).json({
            error: "Erro ao consultar a Geocoding API.",
            googleError: erro.response?.data || erro.message,
        });
    }
};