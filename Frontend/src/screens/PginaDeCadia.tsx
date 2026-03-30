import * as React from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    StyleSheet,
    Text,
    View,
    Image,
    Pressable,
    ScrollView,
    Alert,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import * as ImagePicker from 'expo-image-picker';
import { DOENCAS, RACAS_CANINOS, RACAS_FELINOS } from "../data/racas";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Image assets
const Calendario = require("../../assets/images/calendario.png");
const Localizacao = require("../../assets/images/maps.png");
const Patinha = require("../../assets/images/patinha.png");
const Configuracao = require("../../assets/images/config.png");
const Racao = require("../../assets/images/racao.png");

// Image assets from Figma
const imgEllipse17 = "https://www.figma.com/api/mcp/asset/3373dc01-a1b9-40b1-97a3-d36b3c8b0ba3";

// Opções para espécies
const ESPECIES = ["Canino", "Felino"];

const PginaDeCadia = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = React.useState("imagem");
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
    const [showGeneroOptions, setShowGeneroOptions] = React.useState(false);

    // Form states
    const [formData, setFormData] = React.useState({
        especie: "",
        nomePet: "",
        raca: "",
        idade: "",
        peso: "",
        porte: "",
        genero: "",
        castrado: false,
        doencas: [] as string[],
        observacoes: "",
    });

    const [showEspecieOptions, setShowEspecieOptions] = React.useState(false);
    const [showRacaOptions, setShowRacaOptions] = React.useState(false);
    const [showPorteOptions, setShowPorteOptions] = React.useState(false);
    const [showDoencasOptions, setShowDoencasOptions] = React.useState(false);

    const handleNavigation = (screenName: string) => {
        if (screenName === "back") {
            navigation.goBack();
        } else {
            navigation.navigate(screenName);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permissao Necessaria',
                'E necessario permitir acesso a galeria de imagens para selecionar uma foto.'
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
            Alert.alert('Sucesso', 'Foto selecionada com sucesso!');
        }
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleCastrado = () => {
        setFormData((prev) => ({ ...prev, castrado: !prev.castrado }));
    };

    const handleToggleDoenca = (doenca: string) => {
        setFormData((prev) => {
            if (prev.doencas.includes(doenca)) {
                return {
                    ...prev,
                    doencas: prev.doencas.filter(d => d !== doenca),
                };
            }

            return {
                ...prev,
                doencas: [...prev.doencas, doenca],
            };
        });
    };

    const handleSaveForm = async () => {
        if (!formData.especie || !formData.nomePet || !formData.raca || !formData.idade || !formData.peso) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios!');
            return;
        }

        try {
            const codigoTutor = await AsyncStorage.getItem("codigoTutor");

            if (!codigoTutor) {
                Alert.alert("Atenção", "Não foi possível identificar o tutor. Faça login novamente.");
                return;
            }

            await axios.post(`${API_URL}/pet`, {
                nome: formData.nomePet,
                especie: formData.especie,
                peso: formData.peso,
                porte: formData.porte || "Não informado",
                codigo_tutor: Number(codigoTutor),
            });

            Alert.alert("Sucesso", "Pet cadastrado com sucesso!");
            setFormData({
                especie: "",
                nomePet: "",
                raca: "",
                idade: "",
                peso: "",
                porte: "",
                genero: "",
                castrado: false,
                doencas: [],
                observacoes: "",
            });
            setShowEspecieOptions(false);
            setShowRacaOptions(false);
            setShowPorteOptions(false);
            setShowDoencasOptions(false);
        } catch (erro) {
            console.error("Erro ao cadastrar pet:", erro);
            Alert.alert("Erro", "Não foi possível cadastrar o pet. Tente novamente.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => handleNavigation("back")}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>Cadastrar Pet</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <Pressable
                        style={[
                            styles.tab,
                            styles.tabLeft,
                            activeTab === "imagem" && styles.tabActive,
                        ]}
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
                        style={[
                            styles.tab,
                            styles.tabRight,
                            activeTab === "manual" && styles.tabActive,
                        ]}
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

                {/* Content Area */}
                <ScrollView
                    style={styles.contentArea}
                    contentContainerStyle={styles.contentAreaInner}
                    showsVerticalScrollIndicator={true}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                >
                    {activeTab === "imagem" ? (
                        <View style={styles.imageTabContent}>
                            {/* Dashed Circle with Image Icon */}
                            <View style={styles.circleContainer}>
                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage }}
                                        style={styles.selectedImage}
                                    />
                                ) : (
                                    <>
                                        <Svg width={138} height={138} viewBox="0 0 138 138">
                                            <Circle
                                                cx={69}
                                                cy={69}
                                                r={65}
                                                stroke="#4A5F73"
                                                strokeWidth={2}
                                                fill="none"
                                                strokeDasharray={[6, 6]}
                                            />
                                        </Svg>

                                        {/* Image Icon Inside Circle */}
                                        <Image
                                            source={{ uri: imgEllipse17 }}
                                            style={styles.circleIcon}
                                        />
                                    </>
                                )}
                            </View>

                            {/* Description Text */}
                            <Text style={styles.descriptionText}>
                                Selecione a melhor foto para começar o cadastro do seu pet
                            </Text>

                            {/* Upload Button */}
                            <Pressable
                                style={styles.uploadButton}
                                onPress={pickImage}
                            >
                                <Text style={styles.uploadButtonText}>Selecionar Foto</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.manualTabContent}>
                            {/* Photo Circle */}
                            <Pressable
                                style={styles.photoUploadContainer}
                                onPress={pickImage}
                            >
                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage }}
                                        style={styles.uploadedPhoto}
                                    />
                                ) : (
                                    <View style={styles.emptyPhotoCircle}>
                                        <Svg width={80} height={80} viewBox="0 0 138 138">
                                            <Circle
                                                cx={69}
                                                cy={69}
                                                r={65}
                                                stroke="#4A5F73"
                                                strokeWidth={2}
                                                fill="none"
                                                strokeDasharray={[6, 6]}
                                            />
                                        </Svg>
                                        <Text style={styles.photoUploadText}>Clique para adicionar foto</Text>
                                    </View>
                                )}
                            </Pressable>

                            {/* Form Fields */}
                            <View style={styles.formContainer}>
                                <Text style={styles.fieldLabel}>Espécie *</Text>
                                <Pressable
                                    style={styles.dropdownButton}
                                    onPress={() => setShowEspecieOptions(!showEspecieOptions)}
                                >
                                    <Text style={styles.dropdownButtonText}>
                                        {formData.especie || "Selecione a espécie"}
                                    </Text>
                                </Pressable>
                                {showEspecieOptions && (
                                    <View style={styles.racasDropdown}>
                                        {ESPECIES.map((especie, idx) => (
                                            <Pressable
                                                key={idx}
                                                style={styles.dropdownOption}
                                                onPress={() => {
                                                    handleFormChange('especie', especie);
                                                    handleFormChange('raca', ''); // Limpa raça ao mudar espécie
                                                    setShowEspecieOptions(false);
                                                }}
                                            >
                                                <Text style={[styles.dropdownOptionText, formData.especie === especie && styles.selectedOption]}>
                                                    {especie}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}

                                <Text style={styles.fieldLabel}>Nome do Pet *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Digite o nome do seu pet"
                                    placeholderTextColor="#999"
                                    value={formData.nomePet}
                                    onChangeText={(text) => handleFormChange('nomePet', text)}
                                />

                                <Text style={styles.fieldLabel}>Raça *</Text>
                                <Pressable
                                    style={[styles.dropdownButton, !formData.especie && { opacity: 0.5 }]}
                                    onPress={() => formData.especie && setShowRacaOptions(!showRacaOptions)}
                                    disabled={!formData.especie}
                                >
                                    <Text style={styles.dropdownButtonText}>
                                        {!formData.especie ? "Selecione a espécie primeiro" : (formData.raca || "Selecione a raça")}
                                    </Text>
                                </Pressable>
                                {showRacaOptions && formData.especie && (
                                    <ScrollView style={styles.racasDropdown} nestedScrollEnabled={true}>
                                        {(formData.especie === "Canino" ? RACAS_CANINOS : RACAS_FELINOS).map((raca, idx) => (
                                            <Pressable
                                                key={idx}
                                                style={styles.dropdownOption}
                                                onPress={() => {
                                                    handleFormChange('raca', raca);
                                                    setShowRacaOptions(false);
                                                }}
                                            >
                                                <Text style={[styles.dropdownOptionText, formData.raca === raca && styles.selectedOption]}>
                                                    {raca}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                )}

                                <View style={styles.rowContainer}>
                                    <View style={styles.halfField}>
                                        <Text style={styles.fieldLabel}>Idade *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Ex: 2 anos"
                                            placeholderTextColor="#999"
                                            value={formData.idade}
                                            onChangeText={(text) => handleFormChange('idade', text)}
                                        />
                                    </View>

                                    <View style={styles.halfField}>
                                        <Text style={styles.fieldLabel}>Peso *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Ex: 15 "
                                            placeholderTextColor="#999"
                                            value={formData.peso}
                                            onChangeText={(text) => handleFormChange('peso', text)}
                                        />
                                    </View>
                                </View>

                                <Text style={styles.fieldLabel}>Gênero</Text>
                                <Pressable
                                    style={styles.generoButton}
                                    onPress={() => setShowGeneroOptions(!showGeneroOptions)}
                                >
                                    <Text style={styles.generoButtonText}>
                                        {formData.genero === 'macho' ? 'Macho' : 'Fêmea'}
                                    </Text>
                                </Pressable>
                                {showGeneroOptions && (
                                    <View style={styles.generoDropdown}>
                                        <Pressable
                                            style={styles.generoOption}
                                            onPress={() => {
                                                handleFormChange('genero', 'macho');
                                                setShowGeneroOptions(false);
                                            }}
                                        >
                                            <Text style={styles.generoOptionText}>Macho</Text>
                                        </Pressable>
                                        <Pressable
                                            style={styles.generoOption}
                                            onPress={() => {
                                                handleFormChange('genero', 'femea');
                                                setShowGeneroOptions(false);
                                            }}
                                        >
                                            <Text style={styles.generoOptionText}>Fêmea</Text>
                                        </Pressable>
                                    </View>
                                )}

                                <Text style={styles.fieldLabel}>Porte</Text>
                                <Pressable
                                    style={styles.dropdownButton}
                                    onPress={() => setShowPorteOptions(!showPorteOptions)}
                                >
                                    <Text style={styles.dropdownButtonText}>
                                        {formData.porte || "Selecione o porte"}
                                    </Text>
                                </Pressable>
                                {showPorteOptions && (
                                    <View style={styles.porteDropdown}>
                                        {["Mini", "Pequeno", "Médio", "Grande", "Gigante"].map((porte, idx) => (
                                            <Pressable
                                                key={idx}
                                                style={styles.dropdownOption}
                                                onPress={() => {
                                                    handleFormChange('porte', porte);
                                                    setShowPorteOptions(false);
                                                }}
                                            >
                                                <Text style={[styles.dropdownOptionText, formData.porte === porte && styles.selectedOption]}>
                                                    {porte}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.checkboxContainer}>
                                    <Pressable
                                        style={styles.checkbox}
                                        onPress={handleToggleCastrado}
                                    >
                                        <View style={[styles.checkboxBox, formData.castrado && styles.checkboxBoxChecked]}>
                                            {formData.castrado && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                    </Pressable>
                                    <Text style={styles.checkboxLabel}>Castrado</Text>
                                </View>

                                <Text style={styles.fieldLabel}>Doenças ou Condições</Text>
                                <Pressable
                                    style={styles.dropdownButton}
                                    onPress={() => setShowDoencasOptions(!showDoencasOptions)}
                                >
                                    <Text style={styles.dropdownButtonText}>
                                        {formData.doencas.length > 0 ? `${formData.doencas.length} selecionadas` : "Selecione doenças"}
                                    </Text>
                                </Pressable>
                                {showDoencasOptions && (
                                    <ScrollView style={styles.doencasDropdown} nestedScrollEnabled={true}>
                                        {DOENCAS.map((doenca, idx) => (
                                            <Pressable
                                                key={idx}
                                                style={styles.doencaCheckbox}
                                                onPress={() => handleToggleDoenca(doenca)}
                                            >
                                                <View style={[styles.checkboxBox, formData.doencas.includes(doenca) && styles.checkboxBoxChecked]}>
                                                    {formData.doencas.includes(doenca) && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.doencaCheckboxLabel}>
                                                    {doenca}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                )}

                                <Text style={styles.fieldLabel}>Observações</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textAreaInput]}
                                    placeholder="Digite observações adicionais"
                                    placeholderTextColor="#999"
                                    value={formData.observacoes}
                                    onChangeText={(text) => handleFormChange('observacoes', text)}
                                    multiline={true}
                                    numberOfLines={4}
                                />

                                <Pressable
                                    style={styles.submitButton}
                                    onPress={handleSaveForm}
                                >
                                    <Text style={styles.submitButtonText}>Salvar Pet</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <Pressable
                    style={styles.navItem}
                    onPress={() => handleNavigation("Cadastro")}
                >
                    <Image source={Calendario} style={styles.navIcon} />
                </Pressable>
                <Pressable
                    style={styles.navItem}
                    onPress={() => handleNavigation("Home")}
                >
                    <Image source={Localizacao} style={styles.navIcon} />
                </Pressable>
                <Pressable
                    style={styles.navItem}
                    onPress={() => handleNavigation("Home")}
                >
                    <Image source={Patinha} style={styles.navIcon} />
                </Pressable>
                <Pressable
                    style={styles.navItem}
                    onPress={() => handleNavigation("Home")}
                >
                    <Image source={Racao} style={styles.navIcon} />
                </Pressable>
                <Pressable
                    style={styles.navItem}
                    onPress={() => handleNavigation("Home")}
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
    mainContent: {
        flex: 1,
        minHeight: 0,
    },
    header: {
        backgroundColor: "#D4E9FF",
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 24,
        color: "#344759",
        fontWeight: "bold",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#344759",
        fontFamily: "MuseoModerno-Bold",
        flex: 1,
        textAlign: "center",
    },
    headerSpacer: {
        width: 40,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#D4E9FF",
        height: 48,
    },
    tab: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 0,
    },
    tabLeft: {
        borderBottomLeftRadius: 6,
        backgroundColor: "#D4E9FF",
    },
    tabRight: {
        borderBottomRightRadius: 6,
        backgroundColor: "#D4E9FF",
    },
    tabActive: {
        backgroundColor: "#D4E9FF",
        borderBottomWidth: 2,
        borderBottomColor: "#344759",
    },
    tabText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#344759",
        fontFamily: "MuseoModerno-Bold",
    },
    tabTextActive: {
        color: "#344759",
    },
    contentArea: {
        flex: 1,
        backgroundColor: "#344759",
    },
    contentAreaInner: {
        flexGrow: 1,
        paddingVertical: 30,
        paddingBottom: 140,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    imageTabContent: {
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
    },
    manualTabContent: {
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
    },
    circleContainer: {
        width: 138,
        height: 138,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
        position: "relative",
    },
    circleIcon: {
        width: 138,
        height: 138,
        position: "absolute",
    },
    selectedImage: {
        width: 138,
        height: 138,
        borderRadius: 69,
        borderWidth: 2,
        borderColor: "#4A5F73",
    },
    descriptionText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 20,
        fontFamily: "MuseoModerno-Bold",
    },
    uploadButton: {
        backgroundColor: "#D4E9FF",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 6,
        marginTop: 20,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#344759",
        fontFamily: "MuseoModerno-Bold",
    },
    manualText: {
        fontSize: 18,
        color: "white",
        fontFamily: "MuseoModerno-Bold",
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#d4e9ff',
        paddingVertical: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    navItem: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    navIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    navCenterIcon: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    navCenterIconImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    // Form styles
    photoUploadContainer: {
        marginBottom: 30,
        alignItems: "center",
    },
    emptyPhotoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: "#4A5F73",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(212, 233, 255, 0.1)",
    },
    uploadedPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: "#4A5F73",
    },
    photoUploadText: {
        color: "#999",
        fontSize: 12,
        marginTop: 10,
        textAlign: "center",
    },
    formContainer: {
        width: "100%",
        paddingHorizontal: 20,
    },
    fieldLabel: {
        color: "#D4E9FF",
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 8,
        fontFamily: "MuseoModerno-Bold",
    },
    textInput: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: "#344759",
        fontFamily: "MuseoModerno-Regular",
    },
    textAreaInput: {
        paddingVertical: 12,
        textAlignVertical: "top",
        height: 100,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    halfField: {
        flex: 1,
        marginHorizontal: 5,
    },
    generoButton: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 5,
    },
    generoButtonText: {
        color: "#344759",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
    },
    generoDropdown: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 15,
    },
    generoOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    generoOptionText: {
        color: "#344759",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
    },
    submitButton: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 25,
        marginBottom: 20,
    },
    submitButtonText: {
        color: "#344759",
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "MuseoModerno-Bold",
    },
    // Dropdown styles
    dropdownButton: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 5,
    },
    dropdownButtonText: {
        color: "#344759",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
    },
    racasDropdown: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        marginBottom: 15,
        maxHeight: 200,
    },
    porteDropdown: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        marginBottom: 15,
        overflow: "hidden",
    },
    doencasDropdown: {
        backgroundColor: "#D4E9FF",
        borderRadius: 8,
        marginBottom: 15,
        maxHeight: 200,
    },
    dropdownOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    dropdownOptionText: {
        color: "#344759",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
    },
    selectedOption: {
        fontWeight: "bold",
        color: "#1a5c9e",
    },
    // Checkbox styles
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 15,
    },
    checkbox: {
        marginRight: 10,
    },
    checkboxBox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#D4E9FF",
        borderRadius: 4,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxBoxChecked: {
        backgroundColor: "#D4E9FF",
        borderColor: "#344759",
    },
    checkmark: {
        color: "#344759",
        fontWeight: "bold",
        fontSize: 14,
    },
    checkboxLabel: {
        color: "#D4E9FF",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
    },
    doencaCheckbox: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    doencaCheckboxLabel: {
        color: "#344759",
        fontSize: 14,
        fontFamily: "MuseoModerno-Regular",
        marginLeft: 10,
        flex: 1,
    },
});

export default PginaDeCadia;
