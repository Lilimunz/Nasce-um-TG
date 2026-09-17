import * as React from "react";
import * as Location from "expo-location";
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_URL =
    Platform.OS === "web"
        ? process.env.EXPO_PUBLIC_API_URL_WEB || "http://localhost:3000"
        : process.env.EXPO_PUBLIC_API_MAPS || "http://10.0.2.2:3000";

// Image assets
const Calendario = require("../../assets/images/calendario.png");
const Localizacao = require("../../assets/images/maps.png");
const Patinha = require("../../assets/images/patinha.png");
const Configuracao = require("../../assets/images/config.png");
const Racao = require("../../assets/images/racao.png");

type PlaceNew = {
    id?: string;
    name?: string;
    displayName?: {
        text?: string;
    };
    formattedAddress?: string;
    vicinity?: string;
    location?: {
        latitude?: number;
        longitude?: number;
    };
    geometry?: {
        location?: {
            lat?: number;
            lng?: number;
        };
    };
    currentOpeningHours?: {
        openNow?: boolean;
        weekdayDescriptions?: string[];
    };
    opening_hours?: {
        open_now?: boolean;
    };
    types?: string[];
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    formatted_phone_number?: string;
    place_id?: string;
};

type Hospital = {
    id: string;
    nome: string;
    endereco: string;
    tipo: string;
    status: string;
    horario: string;
    telefone: string;
    latitude: number;
    longitude: number;
    types: string[];
};

type GeocodeResponse = {
    latitude: number;
    longitude: number;
    endereco?: string;
    place_id?: string;
};

const traduzirTipo = (types: string[] = []) => {
    if (types.includes("veterinary_care")) {
        return "Clínica Veterinária";
    }

    if (types.includes("pet_store")) {
        return "Pet Shop";
    }

    if (types.includes("animal_hospital")) {
        return "Hospital Veterinário";
    }

    return "Atendimento Veterinário";
};

const normalizarHospitais = (
    lugares: PlaceNew[] = []
): Hospital[] => {
    return lugares
        .map((lugar, index) => {
            const latitude =
                lugar.location?.latitude ??
                lugar.geometry?.location?.lat;

            const longitude =
                lugar.location?.longitude ??
                lugar.geometry?.location?.lng;

            if (
                typeof latitude !== "number" ||
                typeof longitude !== "number"
            ) {
                return null;
            }

            const estaAberto =
                lugar.currentOpeningHours?.openNow ??
                lugar.opening_hours?.open_now ??
                null;

            let status = "Status indisponível";

            if (estaAberto === true) {
                status = "Aberto agora";
            }

            if (estaAberto === false) {
                status = "Fechado";
            }

            const types = lugar.types || [];

            return {
                id:
                    lugar.id ||
                    lugar.place_id ||
                    lugar.name ||
                    `${latitude}-${longitude}-${index}`,

                nome:
                    lugar.displayName?.text ||
                    lugar.name ||
                    "Local sem nome",

                endereco:
                    lugar.formattedAddress ||
                    lugar.vicinity ||
                    "Endereço não informado",

                tipo: traduzirTipo(types),

                status,

                horario:"",

                telefone:
                    lugar.nationalPhoneNumber ||
                    lugar.internationalPhoneNumber ||
                    lugar.formatted_phone_number ||
                    "",

                latitude,
                longitude,
                types,
            };
        })
        .filter((hospital): hospital is Hospital => hospital !== null);
};

const PginaHospitais = ({
    navigation,
}: {
    navigation: any;
}) => {
    const [enderecoAtual, setEnderecoAtual] = React.useState("");
    const [hospitais, setHospitais] = React.useState<Hospital[]>([]);
    const [carregando, setCarregando] = React.useState(true);
    const [erro, setErro] = React.useState("");

const buscarHospitaisNoBackend = React.useCallback(
    async (lat: number, lng: number) => {
        setCarregando(true);
        setErro("");

        try {
            const response = await axios.get(
                `${API_URL}/hospitais`,
                {
                    params: {
                        lat,
                        lng,
                    },
                }
            );

            const lugares: PlaceNew[] = Array.isArray(
                response.data?.places
            )
                ? response.data.places
                : Array.isArray(response.data)
                    ? response.data
                    : [];

            const hospitaisNormalizados =
                normalizarHospitais(lugares);

            setHospitais(hospitaisNormalizados);

            if (hospitaisNormalizados.length === 0) {
                setErro(
                    "Nenhum hospital encontrado nessa região."
                );
            }
        } catch (error: any) {
            console.error(
                "Erro ao buscar hospitais:",
                error.response?.data || error.message
            );

            setHospitais([]);

            if (error.response?.data?.error) {
                setErro(error.response.data.error);
            } else {
                setErro(
                    "Não foi possível consultar os hospitais."
                );
            }
        } finally {
            setCarregando(false);
        }
    },
    []
);

const buscarPorGPS = React.useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
        const { status } =
            await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            setErro("Permissão de localização negada.");
            setCarregando(false);
            return;
        }

        const localAtual =
            await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

        await buscarHospitaisNoBackend(
            localAtual.coords.latitude,
            localAtual.coords.longitude
        );
    } catch (error) {
        console.error(
            "Erro ao capturar localização:",
            error
        );

        setErro(
            "Erro ao capturar sua localização atual."
        );
        setCarregando(false);
    }
}, [buscarHospitaisNoBackend]);

const buscarPorEnderecoTexto = async () => {
    const endereco = enderecoAtual.trim();

    if (!endereco) {
        setErro("Digite um endereço para pesquisar.");
        return;
    }

    setCarregando(true);
    setErro("");
    setHospitais([]);

    try {
        const response = await axios.get(
            `${API_URL}/geocode`,
            {
                params: {
                    address: endereco,
                },
            }
        );

        const { latitude, longitude } = response.data;

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number"
        ) {
            setErro("Endereço não encontrado.");
            setCarregando(false);
            return;
        }

        await buscarHospitaisNoBackend(
            latitude,
            longitude
        );
    } catch (error: any) {
        console.error(
            "Erro ao buscar endereço:",
            error.response?.data || error.message
        );

        if (error.response?.status === 404) {
            setErro("Endereço não encontrado.");
        } else if (error.response?.data?.error) {
            setErro(error.response.data.error);
        } else {
            setErro("Erro ao tentar buscar este endereço.");
        }

        setHospitais([]);
        setCarregando(false);
    }
};

    React.useEffect(() => {
        buscarPorGPS();
    }, [buscarPorGPS]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.enderecoInput}
                    placeholder="Digite um endereço e aperte Enter"
                    placeholderTextColor="#344759"
                    value={enderecoAtual}
                    onChangeText={setEnderecoAtual}
                    onSubmitEditing={buscarPorEnderecoTexto}
                    returnKeyType="search"
                />
            </View>

            <ScrollView
                style={styles.contentArea}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {carregando ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color="#d4e9ff"
                        />

                        <Text style={styles.loadingText}>
                            Carregando hospitais...
                        </Text>
                    </View>
                ) : null}

                {!carregando && erro ? (
                    <Text style={styles.helperText}>
                        {erro}
                    </Text>
                ) : null}

                {!carregando &&
                !erro &&
                hospitais.length === 0 ? (
                    <Text style={styles.helperText}>
                        Nenhum hospital encontrado.
                    </Text>
                ) : null}

                {hospitais.map((hospital, index) => (
                    <Pressable
                        key={
                            hospital.id ||
                            `${hospital.nome}-${index}`
                        }
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate(
                                "HospitalDetalhes",
                                {
                                    hospital,
                                }
                            )
                        }
                    >
                        <Text style={styles.cardTitle}>
                            {hospital.nome}
                        </Text>

                        <Text style={styles.cardSubtitle}>
                            {hospital.tipo}
                        </Text>

                        <Text style={styles.cardAddress}>
                            {hospital.endereco}
                        </Text>

                        <View style={styles.statusRow}>
                            <Text style={styles.statusText}>
                                {hospital.status}
                            </Text>
                        </View>

                        {hospital.telefone ? (
                            <Text style={styles.cardPhone}>
                                {hospital.telefone}
                            </Text>
                        ) : null}
                    </Pressable>
                ))}

                <View style={{ height: 8 }} />
            </ScrollView>

            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem}>
                    <Image
                        source={Calendario}
                        style={styles.navIcon}
                    />
                </Pressable>

                <Pressable
                    style={[
                        styles.navItem,
                        styles.navItemActive,
                    ]}
                >
                    <Image
                        source={Localizacao}
                        style={styles.navIcon}
                    />
                </Pressable>

                <Pressable
                    style={styles.navItem}
                    onPress={() =>
                        navigation.replace("Home")
                    }
                >
                    <Image
                        source={Patinha}
                        style={styles.navIcon}
                    />
                </Pressable>

                <Pressable
                    style={styles.navItem}
                    onPress={() =>
                        navigation.replace("Alimentos")
                    }
                >
                    <Image
                        source={Racao}
                        style={styles.navIcon}
                    />
                </Pressable>

                <Pressable
                    style={styles.navItem}
                    onPress={() =>
                        navigation.navigate(
                            "ConfiguracaoTutor"
                        )
                    }
                >
                    <Image
                        source={Configuracao}
                        style={styles.navIcon}
                    />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#344759",
    },

    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: "#344759",
    },

    enderecoInput: {
        height: 48,
        backgroundColor: "#f8f8f8",
        borderRadius: 16,
        paddingHorizontal: 16,
        color: "#344759",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
    },

    contentArea: {
        flex: 1,
        backgroundColor: "#344759",
    },

    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },

    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    loadingText: {
        fontFamily: "MuseoModerno-Regular",
        fontSize: 12,
        color: "#d4e9ff",
        opacity: 0.75,
        marginLeft: 8,
    },

    helperText: {
        fontFamily: "MuseoModerno-Regular",
        fontSize: 12,
        color: "#d4e9ff",
        opacity: 0.75,
        marginBottom: 12,
    },

    card: {
        backgroundColor: "#d4e9ff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },

    cardTitle: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 16,
        color: "#344759",
    },

    cardSubtitle: {
        fontFamily: "MuseoModerno-Regular",
        fontSize: 12,
        color: "#344759",
        marginTop: 4,
    },

    cardAddress: {
        fontFamily: "MuseoModerno-Regular",
        fontSize: 12,
        color: "#344759",
        marginTop: 10,
    },

    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },

    statusText: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 12,
        color: "#336699",
    },

    statusMeta: {
        fontFamily: "MuseoModerno-Regular",
        fontSize: 12,
        color: "#344759",
        marginLeft: 8,
    },

    cardPhone: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 12,
        color: "#344759",
        marginTop: 6,
    },

    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#d4e9ff",
        paddingVertical: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderColor: "#336699",
        flexShrink: 0,
    },

    navItem: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    navItemActive: {
        borderTopWidth: 3,
        borderTopColor: "#344759",
        marginTop: -3,
    },

    navIcon: {
        width: 28,
        height: 28,
        resizeMode: "contain",
    },
});

export default PginaHospitais;