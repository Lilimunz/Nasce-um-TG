import * as React from "react";
import { Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InputCustomizado } from "../components/InputFields";
import { useLogin } from "../hooks/useLogin";
import { styles } from '../styles/PginaDeLogInStyles';
import Facebook from "../../assets/images/facebook.svg"
import Google from "../../assets/images/google.svg"
import Eye from "../../assets/images/eye.svg"
import Apple from '../../assets/images/apple.svg'

export const PginaDeLogIn = ({ navigation }: { navigation: any }) => {
  // Puxa tudo do Hook
  const {
    email, setEmail,
    senha, setSenha,
    showSenha, setShowSenha,
    handleLogin, handleCadastro, handleEsqueciSenha, handleHome,
    promptAsync
  } = useLogin(navigation);

  return (
    <SafeAreaView style={styles.pginaDeLogIn}>
      <View style={styles.view}>
        <View style={styles.logInPage}>
          <Text style={styles.logIn1}>Log in</Text>
          <View style={styles.faaLoginCom}>
            <Text style={styles.pginaDeLogInFaaLoginCom}>Faça login com</Text>
            <View style={styles.socialIconsRow}>
              <Pressable onPress={() => promptAsync()}>
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
            <InputCustomizado
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              placeholderTextColor="#344759"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.senhaFieldContainer}>
              <InputCustomizado
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
  )
}

export default PginaDeLogIn;