import * as React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PginaDeEditarTutor = ({ navigation, route }) => {
  const tutorData = route?.params?.tutorData;
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (tutorData) {
      setNome(tutorData.nome ?? "");
      setEmail(tutorData.email ?? "");
    }
  }, [tutorData]);

  const validarEmail = (valor) => {
    const texto = String(valor || "").trim();
    if (!texto) {
      return false;
    }
    return /.+@.+\..+/.test(texto);
  };

  const handleSalvar = async () => {
    const codigoTutor = tutorData?.codigo_tutor;

    if (!codigoTutor) {
      Alert.alert("Atencao", "Tutor nao identificado.");
      return;
    }

    if (!nome.trim() || !email.trim()) {
      Alert.alert("Atencao", "Nome e email sao obrigatorios.");
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert("Atencao", "Email invalido.");
      return;
    }

    setSalvando(true);
    try {
      const response = await axios.put(`${API_URL}/tutor/${codigoTutor}`, {
        nome: nome.trim(),
        email: email.trim(),
      });

      if (response.data?.erro) {
        Alert.alert("Erro", response.data.erro);
        return;
      }

      if (typeof response.data === "string" && response.data.includes("email")) {
        Alert.alert("Erro", response.data);
        return;
      }

      await AsyncStorage.setItem("nomeUsuario", nome.trim());
      await AsyncStorage.setItem("emailUsuario", email.trim());

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar tutor:", error);
      Alert.alert("Erro", "Nao foi possivel atualizar o perfil.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Editar perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Seu nome"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="seu@email.com"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <View style={styles.buttonsRow}>
          <Pressable
            style={[styles.button, styles.buttonCancel]}
            onPress={() => navigation.goBack()}
            disabled={salvando}
          >
            <Text style={styles.buttonCancelText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonConfirm]}
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#344759" />
            ) : (
              <Text style={styles.buttonConfirmText}>Salvar</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#344759",
  },
  header: {
    height: 82,
    backgroundColor: "#D4E9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 20,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#344759",
    fontSize: 20,
  },
  headerTitle: {
    color: "#344759",
    fontSize: 20,
    fontFamily: "MuseoModerno-Bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  label: {
    color: "rgba(212, 233, 255, 0.7)",
    fontSize: 12,
    marginBottom: 6,
    marginTop: 12,
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
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancel: {
    backgroundColor: "#336699",
    marginRight: 12,
  },
  buttonConfirm: {
    backgroundColor: "#D4E9FF",
    marginLeft: 12,
  },
  buttonCancelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "MuseoModerno-Bold",
  },
  buttonConfirmText: {
    color: "#344759",
    fontSize: 16,
    fontFamily: "MuseoModerno-Bold",
  },
});

export default PginaDeEditarTutor;
