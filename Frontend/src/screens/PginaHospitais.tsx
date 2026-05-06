import * as React from "react";
import * as Location from 'expo-location';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_URL = "https://skinning-paragraph-premises.ngrok-free.dev";

// Image assets
const Calendario = require("../../assets/images/calendario.png");
const Localizacao = require("../../assets/images/maps.png");
const Patinha = require("../../assets/images/patinha.png");
const Configuracao = require("../../assets/images/config.png");
const Racao = require("../../assets/images/racao.png");

const normalizarHospitais = (dadosDoGoogle) => {
    return dadosDoGoogle.map((lugar) => {
        // Verifica se está aberto baseado na resposta do Google
        const estaAberto = lugar.opening_hours ? lugar.opening_hours.open_now : null;
        let textoStatus = "Status indisponível";
        if (estaAberto === true) textoStatus = "Aberto agora";
        if (estaAberto === false) textoStatus = "Fechado";

        return {
            id: lugar.place_id,
            nome: lugar.name,
            endereco: lugar.vicinity, // Endereço curto do Google
            
            // ADICIONAMOS AS VARIÁVEIS QUE O SEU CARD PEDE:
            tipo: "Clínica Veterinária", // O Google Nearby não especifica muito, então usamos um padrão
            status: textoStatus,
            horario: "", // O Google Nearby Search não traz o horário detalhado por padrão
            telefone: "", // O Google Nearby Search também não traz telefone (precisaria da API de Place Details)
            
            latitude: lugar.geometry.location.lat,
            longitude: lugar.geometry.location.lng,
            types: lugar.types || [],
        };
    });
};


const PginaHospitais = ({ navigation }) => {
    const [enderecoAtual, setEnderecoAtual] = React.useState("");
    const [hospitais, setHospitais] = React.useState([]);
    const [carregando, setCarregando] = React.useState(true);
    const [erro, setErro] = React.useState("");

    const buscarHospitaisNoBackend = async (lat, lng) => {
        setCarregando(true);
        setErro("");
        try {
            const response = await axios.get(`${API_URL}/hospitais`, {
                params: { lat: lat, lng: lng },
            });
            const payload = Array.isArray(response.data) ? response.data : [];
            setHospitais(normalizarHospitais(payload));
        } catch (erroHospitais) {
            console.error("Erro no backend:", erroHospitais);
            setErro("Não foi possível carregar os hospitais.");
            setHospitais([]);
        } finally {
            setCarregando(false);
        }
    };

    // 3. Função que pega a localização automática
    const buscarPorGPS = React.useCallback(async () => {
        setCarregando(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErro("Permissão de localização negada.");
                setCarregando(false);
                return;
            }
            let localAtual = await Location.getCurrentPositionAsync({});
            await buscarHospitaisNoBackend(localAtual.coords.latitude, localAtual.coords.longitude);
        } catch (erroGPS) {
            setErro("Erro ao capturar sua localização atual.");
            setCarregando(false);
        }
    }, []);

    // 4. Função que busca pelo texto quando aperta ENTER
    const buscarPorEnderecoTexto = async () => {
        if (!enderecoAtual.trim()) return; 

        setCarregando(true);
        setErro("");

        try {
            const resultado = await Location.geocodeAsync(enderecoAtual);
            if (resultado.length > 0) {
                const { latitude, longitude } = resultado[0];
                await buscarHospitaisNoBackend(latitude, longitude);
            } else {
                setErro("Endereço não encontrado.");
                setCarregando(false);
            }
        } catch (erroGeocode) {
            setErro("Erro ao tentar buscar este endereço.");
            setCarregando(false);
        }
    };

    React.useEffect(() => {
        buscarPorGPS();
    }, [buscarPorGPS]);

    const carregarHospitais = React.useCallback(async () => {
        setCarregando(true);
        setErro("");
        
        try {
            // 1. Pede a permissão e pega a localização real do celular
            let { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                setErro("Precisamos da permissão de localização para buscar os hospitais próximos.");
                setCarregando(false);
                return; // Para a execução aqui se o usuário não der permissão
            }

            let localAtual = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = localAtual.coords;

            // 2. Chama o seu backend passando as coordenadas reais
            // Note que o backend espera 'lng' e não 'lon'
            const response = await axios.get(`${API_URL}/hospitais`, {
                params: {
                    lat: latitude,
                    lng: longitude 
                },
            });

            const payload = Array.isArray(response.data) ? response.data : [];
            
            // Supondo que você já tem a função normalizarHospitais declarada no seu arquivo
            setHospitais(normalizarHospitais(payload));
            
        } catch (erroHospitais) {
            console.error("Erro ao carregar hospitais:", erroHospitais);
            setErro("Não foi possível carregar os hospitais.");
            setHospitais([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    React.useEffect(() => {
        carregarHospitais();
    }, [carregarHospitais]);
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.enderecoInput}
                    placeholder="Digite um endereço e aperte Enter"
                    placeholderTextColor="#344759"
                    value={enderecoAtual}
                    onChangeText={setEnderecoAtual}
                    
                    // --- AS DUAS LINHAS NOVAS ---
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
                        <ActivityIndicator size="small" color="#d4e9ff" />
                        <Text style={styles.loadingText}>Carregando hospitais...</Text>
                    </View>
                ) : null}

                {!carregando && erro ? (
                    <Text style={styles.helperText}>{erro}</Text>
                ) : null}

                {!carregando && !erro && hospitais.length === 0 ? (
                    <Text style={styles.helperText}>
                        Nenhum hospital encontrado.
                    </Text>
                ) : null}

                {hospitais.map((hospital, index) => (
                    <Pressable 
                        key={hospital.id ?? `${hospital.nome}-${index}`} 
                        style={styles.card}
                        onPress={() => navigation.navigate("HospitalDetalhes", { hospital })}
                    >
                        <Text style={styles.cardTitle}>{hospital.nome}</Text>
                        <Text style={styles.cardSubtitle}>{hospital.tipo}</Text>
                        <Text style={styles.cardAddress}>{hospital.endereco}</Text>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusText}>{hospital.status}</Text>
                            {hospital.horario ? (
                                <Text style={styles.statusMeta}>{hospital.horario}</Text>
                            ) : null}
                        </View>
                        {hospital.telefone ? (
                            <Text style={styles.cardPhone}>{hospital.telefone}</Text>
                        ) : null}
                    </Pressable>
                ))}
                <View style={{ height: 8 }} />
            </ScrollView>

            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem}>
                    <Image source={Calendario} style={styles.navIcon} />
                </Pressable>
                <Pressable style={[styles.navItem, styles.navItemActive]}>
                    <Image source={Localizacao} style={styles.navIcon} />
                </Pressable>
                <Pressable
                    style={styles.navItem}
                    onPress={() => navigation.navigate("Home")}
                >
                    <Image source={Patinha} style={styles.navIcon} />
                </Pressable>
                <Pressable
                    style={styles.navItem}
                    onPress={() => navigation.navigate("Alimentos")}
                >
                    <Image source={Racao} style={styles.navIcon} />
                </Pressable>
                <Pressable
                    style={styles.navItem}
                    onPress={() => navigation.navigate("ConfiguracaoTutor")}
                >
                    <Image source={Configuracao} style={styles.navIcon} />
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
