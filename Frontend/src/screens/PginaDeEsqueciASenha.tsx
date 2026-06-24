import * as React from "react"
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import axios from "axios"
import Eye from "../../assets/images/eye.svg" // Reaproveitando seu SVG do login!

const API_URL = process.env.EXPO_PUBLIC_API_URL

const PginaDeEsqueciASenha = ({ navigation }) => {
  const [step, setStep] = React.useState(1)
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(900)

  React.useEffect(() => {
    if (step !== 2) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Atenção", "Informe seu e-mail!")
      return
    }

    try {
      const response = await axios.post(`${API_URL}/esqueci-senha`, { email })
      if (response.data.erro) {
        Alert.alert("Erro", response.data.erro)
        return
      }

      setStep(2)
      setTimeLeft(900)
      Alert.alert("Código enviado!", "Verifique sua caixa de entrada no e-mail.")
    } catch (error) {
      Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.")
    }
  }

  const handleReset = async () => {
    if (!code.trim() || !newPassword.trim()) {
      Alert.alert("Atenção", "Informe o código e a nova senha.")
      return
    }

    try {
      const response = await axios.post(`${API_URL}/redefinir-senha`, {
        email,
        codigo: code,
        novaSenha: newPassword
      })

      if (response.data.erro) {
        Alert.alert("Erro", response.data.erro)
        return
      }

      Alert.alert("Sucesso!", "Sua senha foi redefinida. Faça o login!")
      navigation.navigate("Login")
    } catch (error) {
      Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.view}>
        <Text style={styles.titulo}>Recuperar Senha</Text>
        <Text style={styles.subtitulo}>Siga os passos para redefinir sua senha</Text>

        {step === 1 ? (
          <View style={styles.form}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail..."
              placeholderTextColor="#344759"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Pressable style={styles.botao} onPress={handleSendCode}>
              <Text style={styles.textoBotao}>Enviar código</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Login")} style={styles.voltarLink}>
              <Text style={styles.textoVoltar}>Lembrou a senha? <Text style={styles.textoVoltarSublinhado}>Faça log in</Text></Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Código *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o código de 6 dígitos"
              placeholderTextColor="#344759"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            <Text style={styles.timerTexto}>O código expira em <Text style={{ fontFamily: "MuseoModerno-Bold" }}>{formatTime(timeLeft)}</Text></Text>

            <Text style={styles.label}>Nova Senha *</Text>
            <View style={styles.senhaFieldContainer}>
              <TextInput
                style={styles.input}
                placeholder="Informe sua nova senha..."
                placeholderTextColor="#344759"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable style={styles.eyeIconBtn} onPress={() => setShowPassword(!showPassword)}>
                <Eye width={24} height={24} style={{ opacity: showPassword ? 0.5 : 1 }} />
              </Pressable>
            </View>

            <Pressable style={styles.botao} onPress={handleReset}>
              <Text style={styles.textoBotao}>Redefinir Senha</Text>
            </Pressable>

            <Pressable onPress={() => setStep(1)} style={styles.voltarLink}>
              <Text style={styles.textoVoltarSublinhado}>Voltar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#344759",
    justifyContent: "center",
    alignItems: "center"
  },
  view: {
    width: "100%", maxWidth: 400, padding: 24
  },
  titulo: {
    fontFamily: "MuseoModerno-Bold",
    fontSize: 32,
    color: "#d4e9ff",
    textAlign: "center",
    marginBottom: 8
  },
  subtitulo: {
    fontFamily: "MuseoModerno-Regular",
    fontSize: 14,
    color: "rgba(212, 233, 255, 0.6)",
    textAlign: "center",
    marginBottom: 40
  },
  form: {
    width: "100%"
  },
  label: {
    fontFamily: "MuseoModerno-Medium",
    fontSize: 14,
    color: "#d4e9ff",
    marginBottom: 8
  },
  input: {
    height: 55,
    backgroundColor: "#f8f8f8",
    borderRadius: 17,
    paddingLeft: 16,
    paddingRight: 45,
    color: "#344759",
    fontSize: 16,
    fontFamily: "MuseoModerno-Regular",
    marginBottom: 15
  },
  timerTexto: {
    color: "rgba(212, 233, 255, 0.6)",
    fontSize: 12,
    marginBottom: 20,
    marginTop: -5
  },
  senhaFieldContainer: {
    position: "relative",
    justifyContent: "center"
  },
  eyeIconBtn: {
    position: "absolute",
    right: 16,
    top: 16, height: 24,
    width: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  botao: {
    backgroundColor: "#336699",
    borderRadius: 17,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },
  textoBotao: {
    color: "#d4e9ff",
    fontSize: 18,
    fontFamily: "MuseoModerno-Bold"
  },
  voltarLink: {
    marginTop: 30,
    alignItems:
      "center"
  },
  textoVoltar: {
    color: "rgba(212, 233, 255, 0.6)",
    fontSize: 14,
    fontFamily: "MuseoModerno-Regular"
  },
  textoVoltarSublinhado: {
    color: "#d4e9ff",
    textDecorationLine: "underline"
  }
})

export default PginaDeEsqueciASenha