import * as React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import axios from "axios";

const BackIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M15 18L9 12L15 6" stroke="#344759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const PhoneIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="#D4E9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const LocationPinIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#D4E9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="10" r="3" stroke="#D4E9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const CheckIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke="#D4E9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const DirectionsIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const API_URL = process.env.EXPO_PUBLIC_API_MAPS;

const translateType = (type) => {
    const typesMap = {
        veterinary_care: "Atendimento Veterinário",
        health: "Saúde Animal",
        store: "Pet Shop",
        point_of_interest: "Pronto Atendimento",
        pet_store: "Pet Shop",
    };
    return typesMap[type] || type.replace(/_/g, ' ');
};

const PginaHospitalDetalhes = ({ route, navigation }) => {
    const { hospital } = route.params || {};

    const [telefone, setTelefone] = React.useState(hospital?.telefone || "");
    const [buscandoTel, setBuscandoTel] = React.useState(!hospital?.telefone);

    React.useEffect(() => { 
        if (hospital?.id && !telefone) {
            console.log('Fetching phone for hospital id:', hospital.id);
            axios.get(`${API_URL}/hospitais/detalhes/${hospital.id}`)
                .then(res => {
                    const phone = res.data?.international_phone_number || res.data?.formatted_phone_number;
                    if (phone) {
                        setTelefone(phone);
                    }
                })
                .catch(err => {
                console.error('Erro ao buscar detalhes do hospital:', err.response?.data || err.message);
                console.error('Full error object:', err);
            })
                .finally(() => setBuscandoTel(false));
        } else {
            setBuscandoTel(false);
        }
    }, [hospital]);

    if (!hospital) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{color: '#d4e9ff', textAlign: 'center', marginTop: 20}}>Hospital não encontrado.</Text>
                <Pressable onPress={() => navigation.goBack()} style={{marginTop: 20, alignItems: 'center'}}>
                    <Text style={{color: '#d4e9ff'}}>Voltar</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const openDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
        Linking.openURL(url);
    };

    const callHospital = () => {
        if (telefone) {
            Linking.openURL(`tel:${telefone.replace(/\D/g,'')}`);
        }
    };
        


    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <BackIcon />
                    </Pressable>
                    <Text style={styles.headerTitle}>Detalhes</Text>
                    <View style={styles.headerRightSpace} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Informações Principais */}
                    <View style={styles.mainInfoCard}>
                        <Text style={styles.hospitalName}>{hospital.nome}</Text>
                        <Text style={styles.hospitalCategory}>{hospital.tipo}</Text>
                        
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{hospital.status}</Text>
                        </View>
                    </View>

                    {/* Contatos e Endereço */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <LocationPinIcon />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Endereço</Text>
                                <Text style={styles.infoValue}>{hospital.endereco}</Text>
                            </View>
                        </View>

                        {telefone ? (
                            <Pressable style={[styles.infoRow, {marginTop: 20}]} onPress={callHospital}>
                                <View style={styles.iconContainer}>
                                    <PhoneIcon />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Telefone</Text>
                                    <Text style={styles.infoValue}>{telefone}</Text>
                                </View>
                            </Pressable>
                        ) : (
                            <View style={[styles.infoRow, {marginTop: 20}]}>
                                <View style={styles.iconContainer}>
                                    <PhoneIcon />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Telefone</Text>
                                    <Text style={styles.infoValue}>{buscandoTel ? "Carregando..." : "Não disponível"}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Especialidades */}
                    <View style={styles.specialtiesSection}>
                        <Text style={styles.sectionTitle}>Especialidades</Text>
                        <View style={styles.specialtiesList}>
                            {(hospital.types || [])
                                .filter((item) => item !== "establishment")
                                .map((item, index) => (
                                <View key={index} style={styles.specialtyItem}>
                                    <CheckIcon />
                                    <Text style={styles.specialtyText}>{translateType(item)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Action Bottom Bar */}
                <View style={styles.bottomBar}>
                    <Pressable style={styles.primaryButton} onPress={openDirections}>
                        <DirectionsIcon />
                        <Text style={styles.primaryButtonText}>Rotas</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#D4E9FF", 
    },
    container: {
        flex: 1,
        backgroundColor: "#344759", 
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: "#D4E9FF", 
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 18,
        color: "#344759",
    },
    headerRightSpace: {
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 32,
    },
    mainInfoCard: {
        marginBottom: 32,
    },
    hospitalName: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 26,
        color: "#FFFFFF",
    },
    hospitalCategory: {
        fontFamily: "MuseoModerno-Medium",
        fontSize: 16,
        color: "#D4E9FF",
        marginTop: 6,
        opacity: 0.8,
    },
    statusBadge: {
        backgroundColor: "rgba(212, 233, 255, 0.15)",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 16,
    },
    statusText: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 12,
        color: "#D4E9FF",
    },
    infoSection: {
        marginBottom: 32,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(212, 233, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontFamily: "MuseoModerno-Regular",
        fontSize: 12,
        color: "#D4E9FF",
        opacity: 0.7,
        marginBottom: 4,
    },
    infoValue: {
        fontFamily: "MuseoModerno-Medium",
        fontSize: 15,
        color: "#FFFFFF",
    },
    specialtiesSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 18,
        color: "#D4E9FF",
        marginBottom: 16,
    },
    specialtiesList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    specialtyItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(212, 233, 255, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(212, 233, 255, 0.2)",
    },
    specialtyText: {
        fontFamily: "MuseoModerno-Medium",
        fontSize: 13,
        color: "#FFFFFF",
        marginLeft: 8,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#344759",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderColor: "rgba(212, 233, 255, 0.1)",
    },
    primaryButton: {
        backgroundColor: "#3B5B81",
        flexDirection: "row",
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonText: {
        fontFamily: "MuseoModerno-Bold",
        fontSize: 16,
        color: "#FFFFFF",
        marginLeft: 12,
    },
});

export default PginaHospitalDetalhes;
