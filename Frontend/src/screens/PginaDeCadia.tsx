import * as React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Image assets
const Calendario = require("../../assets/images/calendario.png");
const Localizacao = require("../../assets/images/maps.png");
const Patinha = require("../../assets/images/patinha.png");
const Configuracao = require("../../assets/images/config.png");
const Racao = require("../../assets/images/racao.png");

const PginaDeCadia = ({ navigation }) => {
    const [activeTab, setActiveTab] = React.useState("imagem");
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    // Form states
    const [nome, setNome] = React.useState("");
    const [especie, setEspecie] = React.useState("");
    const [porte, setPorte] = React.useState("");
    const [raca, setRaca] = React.useState("");
    const [sexo, setSexo] = React.useState("");
    const [dataNasc, setDataNasc] = React.useState("");
    const [peso, setPeso] = React.useState("");
    const [carregando, setCarregando] = React.useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert(
                "Permissão Necessária",
                "É necessário permitir acesso à galeria de imagens para selecionar uma foto."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            Alert.alert("Sucesso", "Foto selecionada com sucesso!");
        }
    };

    const handleCadastrar = async () => {
        if (!nome || !especie || !sexo) {
            Alert.alert(
                "Atenção",
                "Preencha os campos obrigatórios (Nome, Espécie e Sexo)."
            );
            return;
        }

        setCarregando(true);
        try {
            const codigoTutor = await AsyncStorage.getItem("codigoTutor");

            if (!codigoTutor) {
                Alert.alert(
                    "Atenção",
                    "Não foi possível identificar o tutor. Faça login novamente."
                );
                setCarregando(false);
                return;
            }

            await axios.post(`${API_URL}/pet`, {
                nome,
                especie,
                peso: peso || "0",
                porte: porte || "Não informado",
                codigo_tutor: Number(codigoTutor),
            });

            // Sincronizar pets com o backend
            try {
                const perfilResponse = await axios.get(
                    `${API_URL}/tutor/${codigoTutor}/perfil`
                );
                if (perfilResponse.data && perfilResponse.data.pets) {
                    await AsyncStorage.setItem(
                        "petsList",
                        JSON.stringify(perfilResponse.data.pets)
                    );
                }
            } catch (erroSync) {
                console.log("Aviso: Não foi possível sincronizar os pets:", erroSync);
            }

            Alert.alert("Sucesso!", "Pet cadastrado com sucesso!");
            setNome("");
            setEspecie("");
            setPorte("");
            setRaca("");
            setSexo("");
            setDataNasc("");
            setPeso("");
            setSelectedImage(null);
            navigation.navigate("Home");
        } catch (error) {
            console.error("Erro ao cadastrar pet:", error);
            Alert.alert("Erro", "Não foi possível cadastrar o pet.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.voltarText}>{"< Voltar"}</Text>
                </Pressable>
                <Text style={styles.headerTitle}>🐾 Cadastrar Pet</Text>
            </View>

            {/* Abas */}
            <View style={styles.tabsContainer}>
                <Pressable
                    style={[styles.tab, activeTab === "imagem" && styles.tabActive]}
                    onPress={() => setActiveTab("imagem")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "imagem" && styles.tabTextActive,
                        ]}
                    >
                        Imagem
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.tab, activeTab === "manual" && styles.tabActive]}
                    onPress={() => setActiveTab("manual")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "manual" && styles.tabTextActive,
                        ]}
                    >
                        Manual
                    </Text>
                </Pressable>
            </View>

            {/* Conteúdo */}
            <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
                {activeTab === "imagem" ? (
                    <View style={styles.imageTabContent}>
                        {/* Círculo de Imagem */}
                        <View style={styles.circleContainer}>
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                            ) : (
                                <View style={styles.emptyCircle}>
                                    <Text style={styles.emptyCircleIcon}>📷</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.descriptionText}>
                            Selecione a melhor foto para começar o cadastro do seu pet
                        </Text>

                        <Pressable style={styles.uploadButton} onPress={pickImage}>
                            <Text style={styles.uploadButtonText}>Selecionar Foto</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Nome *</Text>
                        <TextInput
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                            placeholder="Nome do pet"
                            placeholderTextColor="rgba(212,233,255,0.3)"
                        />

                        <Text style={styles.label}>Espécie *</Text>
                        <TextInput
                            style={styles.input}
                            value={especie}
                            onChangeText={setEspecie}
                            placeholder="Cachorro, Gato, etc."
                            placeholderTextColor="rgba(212,233,255,0.3)"
                        />

                        <Text style={styles.label}>Porte</Text>
                        <TextInput
                            style={styles.input}
                            value={porte}
                            onChangeText={setPorte}
                            placeholder="Pequeno, Médio, Grande"
                            placeholderTextColor="rgba(212,233,255,0.3)"
                        />

                        <Text style={styles.label}>Raça</Text>
                        <TextInput
                            style={styles.input}
                            value={raca}
                            onChangeText={setRaca}
                            placeholder="Ex: Labrador, SRD..."
                            placeholderTextColor="rgba(212,233,255,0.3)"
                        />

                        <Text style={styles.label}>Sexo *</Text>
                        <TextInput
                            style={styles.input}
                            value={sexo}
                            onChangeText={setSexo}
                            placeholder="Macho ou Fêmea"
                            placeholderTextColor="rgba(212,233,255,0.3)"
                        />

                        <Text style={styles.label}>Data de Nascimento</Text>
                        <TextInput
                            style={styles.input}
                            value={dataNasc}
                            onChangeText={setDataNasc}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="rgba(212,233,255,0.3)"
                        />

                        <Text style={styles.label}>Peso (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={peso}
                            onChangeText={setPeso}
                            placeholder="Ex: 3,5"
                            keyboardType="numeric"
                            placeholderTextColor="rgba(212,233,255,0.3)"
                        />

                        <Pressable
                            style={[styles.btnCadastrar, carregando && styles.btnDisabled]}
                            onPress={handleCadastrar}
                            disabled={carregando}
                        >
                            {carregando ? (
                                <ActivityIndicator color="#D4E9FF" size="small" />
                            ) : (
                                <Text style={styles.btnText}>Cadastrar Pet</Text>
                            )}
                        </Pressable>
                        <View style={{ height: 40 }} />
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <Pressable style={styles.navItem}>
                    <Image source={Calendario} style={styles.navIcon} />
                </Pressable>
                <Pressable style={styles.navItem}>
                    <Image source={Localizacao} style={styles.navIcon} />
                </Pressable>
                <Pressable style={styles.navItem}>
                    <Image source={Patinha} style={styles.navIcon} />
                </Pressable>
                <Pressable style={styles.navItem}>
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
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        gap: 15,
    },
    voltarText: {
        color: "#D4E9FF",
        fontSize: 16,
    },
    headerTitle: {
        color: "#D4E9FF",
        fontSize: 18,
        fontFamily: "MuseoModerno-Bold",
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#344759",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(212, 233, 255, 0.1)",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: "#d4e9ff",
    },
    tabText: {
        color: "rgba(212, 233, 255, 0.5)",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
    },
    tabTextActive: {
        color: "#d4e9ff",
        fontFamily: "MuseoModerno-Bold",
    },
    contentArea: {
        flex: 1,
        backgroundColor: "#344759",
    },
    imageTabContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    circleContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    emptyCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: "#d4e9ff",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(212, 233, 255, 0.05)",
    },
    emptyCircleIcon: {
        fontSize: 50,
    },
    selectedImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: "#d4e9ff",
    },
    descriptionText: {
        color: "#d4e9ff",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
        fontFamily: "MuseoModerno-Regular",
    },
    uploadButton: {
        backgroundColor: "#d4e9ff",
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
    },
    uploadButtonText: {
        color: "#344759",
        fontSize: 16,
        fontFamily: "MuseoModerno-Bold",
        textAlign: "center",
    },
    label: {
        color: "rgba(212, 233, 255, 0.6)",
        fontSize: 12,
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        backgroundColor: "rgba(51, 102, 153, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(212, 233, 255, 0.12)",
        color: "#D4E9FF",
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontFamily: "MuseoModerno-Regular",
        fontSize: 14,
    },
    btnCadastrar: {
        backgroundColor: "#336699",
        height: 55,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    btnText: {
        color: "#D4E9FF",
        fontSize: 16,
        fontFamily: "MuseoModerno-Bold",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#d4e9ff",
        paddingVertical: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    navItem: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    navIcon: {
        width: 28,
        height: 28,
        resizeMode: "contain",
    },
});

export default PginaDeCadia;
