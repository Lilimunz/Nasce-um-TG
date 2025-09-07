import * as React from "react";
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import Facebook from "../../assets/images/facebook.svg";
import Google from "../../assets/images/google.svg";
import Eye from "../../assets/images/eye.svg";
import Apple from '../../assets/images/apple.svg'

const PginaDeLogIn = () => {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [showSenha, setShowSenha] = React.useState(false);

  const handleLogin = () => {
    // lógica de login aqui

  };

  const handleCadastro = () => {
    // lógica de cadastro aqui
  };

  const handleEsqueciSenha = () => {
    // lógica de esqueci senha aqui
  };

  return (
    <SafeAreaView style={styles.pginaDeLogIn}>
      <View style={styles.view}>
        <View style={styles.logInPage}>
          <Text style={styles.logIn1}>Log in</Text>
          <View style={styles.faaLoginCom}>
            <Text style={styles.pginaDeLogInFaaLoginCom}>Faça login com</Text>
            <View style={styles.socialIconsRow}>
              <Pressable onPress={() => { /* lógica Google */ }}>
                <Google style={styles.socialIcon} width={50} height={50} />
              </Pressable>
              <Pressable onPress={() => { /* lógica Facebook */ }}>
                <Facebook style={styles.socialIcon} width={50} height={50} />
              </Pressable>
              <Pressable onPress={() => { /* lógica Apple */ }}>
                <Apple style={styles.socialIcon} width={50} height={50} />
              </Pressable>
            </View>
          </View>
          <View style={styles.inputsContainer}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              placeholderTextColor="#344759"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.senhaFieldContainer}>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showSenha}
                placeholder="Digite sua senha"
                placeholderTextColor="#344759"
              />
              <Pressable
                style={styles.eyeIconBtn}
                onPress={() => setShowSenha((prev) => !prev)}
              >
                <Eye width={24} height={24} />
              </Pressable>
              <Pressable onPress={handleEsqueciSenha} style={styles.esqueciASenhaBtn}>
                <Text style={styles.esqueciASenha}>Esqueci a senha</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.rectangleContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.rectanglePressable,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.pginaDeLogInLogIn}>Log in</Text>
            </Pressable>
          </View>
          <View style={styles.cadastreSeRow}>
            <Text style={styles.noTemUma}>Não tem uma conta?</Text>
            <Pressable onPress={handleCadastro}>
              <Text style={styles.cadastreSe2}> Cadastre-se</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  input: {
    height: 55,
    backgroundColor: "#f8f8f8",
    borderRadius: 17,
    paddingLeft: 16,
    color: "#344759",
    fontSize: 16,
    fontFamily: "MuseoModerno-Regular",
    marginBottom: 25, // aumente aqui para mais espaçamento entre as caixas
    boxShadow: "0px 4px 12px rgba(0,0,0,0.30)", // sombra para web
    shadowOpacity: 0.15, // sombra para mobile
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: "#000",
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
  groupIcon: { //caixinha do google
    marginLeft: -129.5,
    width: 53,
    marginTop: -22.5
  },
  logIn: {//titulo de login da pg posição
    marginTop: -283.5,
    marginLeft: -52.5,
  },
  rectanglePressable: { //retangulo do botão
    backgroundColor: "#336699",
    borderRadius: 17,
    width: "100%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.25)", // sombra para web
    shadowOpacity: 0.25, // sombra para mobile
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

export default PginaDeLogIn;