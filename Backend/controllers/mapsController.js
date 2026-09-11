const { Client } = require("@googlemaps/google-maps-services-js")
const googleMapsClient = new Client({})

exports.buscarHospitais = async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat)
        const lng = parseFloat(req.query.lng)
        if (!lat || !lng) return res.json({ error: "Latitude e longitude são obrigatórias." })

        const response = await googleMapsClient.placesNearby({
            params: {
                location: { lat: lat, lng: lng },
                radius: 10000,
                type: 'veterinary_care',
                keyword: ['hospital veterinario', 'Clínica veterinária', 'Hospital Veterinário 24 Horas', 'Pet Hospital'],
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });
        res.json(response.data.results)
    } catch (erro) {
        console.error('Erro ao buscar hospitais no Google Maps:', erro);
        res.json({ error: "Erro interno ao consultar o mapa." })
    }
};

exports.detalhesHospital = async (req, res) => {
    try {
        const place_id = req.params.place_id;
        const response = await googleMapsClient.placeDetails({
            params: {
                place_id: place_id,
                fields: ['formatted_phone_number'],
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });
        res.json(response.data.result)
    } catch (erro) {
        console.error('Erro ao buscar detalhes no Google Maps:', erro);
        res.json({ error: "Erro interno ao consultar o mapa." })
    }
}