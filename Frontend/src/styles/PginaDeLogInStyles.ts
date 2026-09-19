import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    pginaDeLogIn: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#344759",
    },
    view: {
        width: "100%",
        maxWidth: 400,
        flex: 1,
        alignSelf: "center",
    },
    logInPage: {
        flex: 1,
        width: "100%",
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#344759",
    },
    logIn1: {
        fontFamily: "MuseoModerno-Bold",
        fontWeight: "700",
        fontSize: 35,
        color: "#d4e9ff",
        textAlign: "center",
        marginBottom: 24,
    },
    faaLoginCom: {
        width: "100%",
        alignItems: "center",
        marginBottom: 24,
    },
    pginaDeLogInFaaLoginCom: {
        fontWeight: "600",
        fontFamily: "MuseoModerno-SemiBold",
        textAlign: "center",
        color: "#d4e9ff",
        fontSize: 15,
        marginBottom: 12,
    },
    socialIconsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 25,
        marginTop: 8,
    },
    socialIcon: {
        marginHorizontal: 8,
    },
    inputsContainer: {
        width: "100%",
        marginBottom: 24,
    },
    senhaFieldContainer: {
        position: "relative",
        marginBottom: 25,
        justifyContent: "center",
    },
    eyeIconBtn: {
        position: "absolute",
        right: 16,
        top: 16,
        opacity: 0.92,
        height: 24,
        width: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    esqueciASenhaBtn: {
        position: "absolute",
        right: 16,
        bottom: -22,
    },
    esqueciASenha: {
        fontFamily: "MuseoModerno-Medium",
        fontWeight: "500",
        textAlign: "right",
        color: "#d4e9ff",
        fontSize: 15,
        textDecorationLine: "underline"
    },
    rectangleContainer: {
        width: "80%",
        alignSelf: "center",
        marginTop: 16,
        marginBottom: 24,
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowColor: "rgba(0, 0, 0, 1)",
    },
    pginaDeLogInLogIn: {
        fontSize: 20,
        color: "#d4e9ff",
        fontFamily: "MuseoModerno-Bold",
        fontWeight: "700",
        textAlign: "center",
    },
    buttonPressed: {
        opacity: 0.7,
    },
    cadastreSeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
    },
    noTemUma: {
        color: "#f8f8f8",
        fontFamily: "MuseoModerno-Regular",
        fontSize: 18,
        textAlign: "left",
    },
    cadastreSe2: {
        fontSize: 18,
        fontFamily: "MuseoModerno-Medium",
        fontWeight: "500",
        textAlign: "left",
        color: "#d4e9ff",
        textDecorationLine: "underline"
    },
    pginaDeLogInGroupParent: {
        marginTop: -119,
        marginLeft: -137.5,
        width: 259,
        height: 53,
        left: "50%",
        top: "50%",
    },
    rectangleParent: {
        marginLeft: -26.5,
        width: 53,
        marginTop: -26.5
    },
    groupIcon: {
        marginLeft: -129.5,
        width: 53,
        marginTop: -22.5
    },
    logIn: {
        marginTop: -283.5,
        marginLeft: -52.5,
    },
    rectanglePressable: {
        backgroundColor: "#336699",
        borderRadius: 17,
        width: "100%",
        height: 55,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4, // Sombra para Android (substituiu o boxShadow web)
        shadowOpacity: 0.25, // sombra para mobile iOS
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowColor: "#000",
    },
    pginaDeLogInGroupChild: {
        marginTop: 64
    },
    senha: {
        left: 0,
        marginTop: 79
    },
    eyeIcon: {
        right: 21,
        width: 24,
        opacity: 0.92,
        marginTop: 79,
        height: 24
    },
    groupChild2: {
        marginTop: -21
    },
    email: {
        marginTop: -6,
        left: 0
    },
    senhaTypo: {
        color: "#344759",
        fontSize: 16,
        fontFamily: "MuseoModerno-Regular",
        textAlign: "left",
        top: "47%",
        position: "absolute"
    },
});