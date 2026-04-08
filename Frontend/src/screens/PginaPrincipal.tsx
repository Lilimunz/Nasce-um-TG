import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Calendario from "../../assets/images/calendario.png";
import Localizacao from "../../assets/images/maps.png";
import Patinha from "../../assets/images/patinha.png";
import Configuracao from "../../assets/images/config.png";
import Racao from "../../assets/images/racao.png";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getPetEmoji = (especie) => {
    if (!especie) {
        return '🐾';
    }
    const especieNormalizada = especie.toLowerCase();
    if (especieNormalizada.includes('felino') || especieNormalizada.includes('gato')) {
        return '🐱';
    }
    return '🐶';
};

export function PginaPrincipal({ navigation }) {
    const [nomeUsuario, setNomeUsuario] = useState('Usuário');
    const [pets, setPets] = useState([]);
    const [carregandoPets, setCarregandoPets] = useState(true);
    const [erroPets, setErroPets] = useState('');

    const carregarPets = async () => {
        setCarregandoPets(true);
        setErroPets('');
        try {
            const codigoTutor = await AsyncStorage.getItem('codigoTutor');
            if (!codigoTutor) {
                setErroPets('Não foi possível identificar o tutor.');
                setPets([]);
                return;
            }
            
            // Buscar dados frescos do backend
            const response = await axios.get(`${API_URL}/tutor/${codigoTutor}/perfil`);
            if (response.data && response.data.pets) {
                setPets(Array.isArray(response.data.pets) ? response.data.pets : []);
                // Armazenar no AsyncStorage para uso offline
                await AsyncStorage.setItem('petsList', JSON.stringify(response.data.pets));
            } else {
                setPets([]);
            }
        } catch (erro) {
            console.error('Erro ao buscar pets:', erro);
            // Tentar carregar do AsyncStorage como fallback
            try {
                const petsSalvos = await AsyncStorage.getItem('petsList');
                if (petsSalvos) {
                    setPets(JSON.parse(petsSalvos));
                    setErroPets('');
                } else {
                    setErroPets('Não foi possível carregar os pets.');
                    setPets([]);
                }
            } catch (erroStorage) {
                setErroPets('Não foi possível carregar os pets.');
                setPets([]);
            }
        } finally {
            setCarregandoPets(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            carregarPets();
        });

        return unsubscribe;
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Meu(s) Pet(s)</Text>

                {carregandoPets ? (
                    <Text style={styles.helperText}>Carregando pets...</Text>
                ) : null}

                {!carregandoPets && erroPets ? (
                    <Text style={styles.helperText}>{erroPets}</Text>
                ) : null}

                {!carregandoPets && !erroPets && pets.length === 0 ? (
                    <Text style={styles.helperText}>Você ainda não tem pets cadastrados.</Text>
                ) : null}

                {pets.map((pet, index) => (
                    <TouchableOpacity
                        key={pet.codigo_pet ?? `${pet.nome}-${index}`}
                        style={styles.petCard}
                        onPress={() => navigation.navigate('PetProfile', { petData: pet })}
                    >
                        <View style={styles.petAvatar}>
                            <Text style={styles.petAvatarText}>{getPetEmoji(pet.especie)}</Text>
                        </View>
                        <View style={styles.petInfo}>
                            <Text style={styles.petName}>{pet.nome}</Text>
                            <Text style={styles.petMeta}>
                                {pet.especie}
                                {pet.raca ? ` · ${pet.raca}` : ''}
                            </Text>
                        </View>
                        <Text style={styles.petChevron}>{'>'}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={styles.adicionarPetCard}
                    onPress={() => navigation.navigate("Cadastro")}
                >
                    <View style={styles.adicionarPetAvatar}>
                        <Text style={styles.adicionarPetIcon}>+</Text>
                    </View>
                    <View style={styles.adicionarPetInfo}>
                        <Text style={styles.adicionarPetLabel}>Adicionar pet</Text>
                        <Text style={styles.adicionarPetSub}>Cadastre um novo pet</Text>
                    </View>
                    <Text style={styles.adicionarPetChevron}>{'>'}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Image source={Calendario} style={styles.navIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Image source={Localizacao} style={styles.navIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Image source={Patinha} style={styles.navIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Image source={Racao} style={styles.navIcon} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate("ConfiguracaoTutor")}
                >
                    <Image source={Configuracao} style={styles.navIcon} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#344759',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        justifyContent: 'flex-start',
    },
    title: {
        fontFamily: 'MuseoModerno-Bold',
        fontSize: 24,
        color: '#d4e9ff',
        marginBottom: 16,
    },
    helperText: {
        fontFamily: 'MuseoModerno-Regular',
        fontSize: 14,
        color: '#d4e9ff',
        opacity: 0.75,
        marginBottom: 16,
    },
    petCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(51, 102, 153, 0.18)',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 233, 255, 0.18)',
        marginBottom: 12,
    },
    petAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#336699',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    petAvatarText: {
        fontSize: 22,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontFamily: 'MuseoModerno-Bold',
        fontSize: 16,
        color: '#d4e9ff',
    },
    petMeta: {
        fontFamily: 'MuseoModerno-Regular',
        fontSize: 12,
        color: '#d4e9ff',
        opacity: 0.7,
        marginTop: 2,
    },
    petChevron: {
        fontSize: 20,
        color: '#d4e9ff',
        opacity: 0.5,
    },
    adicionarPetCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#336699',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#d4e9ff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 6,
    },
    adicionarPetAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#d4e9ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    adicionarPetInfo: {
        flex: 1,
    },
    adicionarPetLabel: {
        fontFamily: 'MuseoModerno-Bold',
        fontSize: 16,
        color: '#d4e9ff',
    },
    adicionarPetSub: {
        fontFamily: 'MuseoModerno-SemiBold',
        fontSize: 12,
        color: '#d4e9ff',
        opacity: 0.8,
        marginTop: 4,
    },
    adicionarPetIcon: {
        fontFamily: 'MuseoModerno-Bold',
        fontSize: 24,
        color: '#336699',
    },
    adicionarPetChevron: {
        fontSize: 20,
        color: '#d4e9ff',
        opacity: 0.7,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#d4e9ff',
        paddingVertical: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderColor: '#336699',
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
});