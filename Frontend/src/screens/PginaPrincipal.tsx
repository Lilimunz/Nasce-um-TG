import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Calendario from "../../assets/images/calendario.png";
import Localizacao from "../../assets/images/maps.png";
import Patinha from "../../assets/images/patinha.png";
import Configuracao from "../../assets/images/config.png";
import Racao from "../../assets/images/racao.png";


export function PaginaPrincipal() {
    const [nomeUsuario, setNomeUsuario] = useState('Usuário');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Meu(s) Pet(s)</Text>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Adicionar Pet Section */}
                <TouchableOpacity style={styles.adicionarPetCard}>
                    <Text style={styles.adicionarPetLabel}>Adicionar pet</Text>
                    <Text style={styles.adicionarPetIcon}>+</Text>
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
                <TouchableOpacity style={styles.navItem}>
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
    header: {
        backgroundColor: '#d4e9ff',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    headerTitle: {
        fontFamily: 'MuseoModerno-Bold',
        fontSize: 20,
        color: '#336699',
        textAlign: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'flex-start',
    },
    adicionarPetCard: {
        backgroundColor: '#d4e9ff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    adicionarPetLabel: {
        fontFamily: 'MuseoModerno-SemiBold',
        fontSize: 16,
        color: '#336699',
        marginBottom: 20,
    },
    adicionarPetIcon: {
        fontSize: 48,
        color: '#336699',
        fontWeight: 'bold',
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
});