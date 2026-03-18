import * as React from "react";
import axios  from 'axios';
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Eye from "../../assets/images/eye.svg";

const PginaDeCadastro = ({ navigation }) => {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [confirmaSenha, setConfirmaSenha] = React.useState("");
  const [showSenha, setShowSenha] = React.useState(false);

  const handleCadastro = async () => {
    // 1. Verifica se os campos estão vazios
    if (!nome || !email || !senha || !confirmaSenha) {
      alert("Preencha todos os campos");
      return;
    }

    // 2. Verifica se a senha e a confirmação são iguais
    if (senha !== confirmaSenha) {
      alert("As senhas não conferem!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/tutor", {
        nome,
        email,
        senha,
      });

      console.log("resposta do servidor: ", response.data);

      // 3. Lê a resposta do backend. Se for a mensagem de erro, exibe o alerta e para a função.
      if (response.data === "Este e-mail já está cadastrado.") {
        alert("Este e-mail já está cadastrado!");
        return; 
      }

      // 4. Se passou pelas validações e o backend não acusou erro, é sucesso!
      alert("Usuário cadastrado com sucesso!");

      // Limpa os campos
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmaSenha("");
      
      // Redirecionar para o login automaticamente
      navigation.navigate("Login");

    } catch (error) {
      console.error("Erro na requisição: ", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  const handleLogin = () => {
    // navegação para login
    navigation.navigate("Login")
  };

  return (
    <SafeAreaView style={styles.pginaDeCadastro}>
      <View style={styles.view}>
        <View style={styles.cadastroPage}>
          <Text style={styles.titulo}>Crie sua conta</Text>
          <View style={styles.inputsContainer}>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome"
              placeholderTextColor="#344759"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
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
                placeholder="Senha"
                placeholderTextColor="#344759"
              />
              <Pressable
                style={styles.eyeIconBtn}
                onPress={() => setShowSenha((prev) => !prev)}
              >
                <Eye width={24} height={24} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              value={confirmaSenha}
              onChangeText={setConfirmaSenha}
              secureTextEntry={!showSenha}
              placeholder="Confirme a senha"
              placeholderTextColor="#344759"
            />
          </View>
          <View style={styles.rectangleContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.rectanglePressable,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCadastro}
            >
              <Text style={styles.cadastroBtnText}>Cadastrar-se</Text>
            </Pressable>
          </View>
          <View style={styles.loginRow}>
            <Text style={styles.temConta}>Já tem uma conta?</Text>
            <Pressable onPress={handleLogin}>
              <Text style={styles.loginLink}> Faça log in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pginaDeCadastro: {
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
  cadastroPage: {
    flex: 1,
    width: "100%",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#344759",
  },
  titulo: {
    fontFamily: "MuseoModerno-Bold",
    fontWeight: "700",
    fontSize: 32,
    color: "#d4e9ff",
    textAlign: "center",
    marginBottom: 35,
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
    marginBottom: 28,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: "#000",
  },
  senhaFieldContainer: {
    position: "relative",
    marginBottom: 5,
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
  rectangleContainer: {
    width: "80%",
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  rectanglePressable: {
    backgroundColor: "#336699",
    borderRadius: 17,
    width: "100%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.25)",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: "#000",
  },
  cadastroBtnText: {
    fontSize: 20,
    color: "#d4e9ff",
    fontFamily: "MuseoModerno-Bold",
    fontWeight: "700",
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  temConta: {
    color: "#f8f8f8",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 18,
    textAlign: "left",
  },
  loginLink: {
    fontSize: 18,
    fontFamily: "MuseoModerno-Medium",
    fontWeight: "500",
    textAlign: "left",
    color: "#d4e9ff",
    textDecorationLine: "underline",
  },
});

export default PginaDeCadastro;