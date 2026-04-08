import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PginaDeConfiguracaoTutor = ({ navigation }) => {
  const [tutor, setTutor] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState("");
  const [excluindo, setExcluindo] = React.useState(false);

  const carregarTutor = React.useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const codigoTutor = await AsyncStorage.getItem("codigoTutor");
      if (!codigoTutor) {
        setErro("Tutor nao identificado.");
        setCarregando(false);
        return;
      }

      const response = await axios.get(`${API_URL}/tutor/${codigoTutor}`);
      if (response.data && !response.data.erro) {
        setTutor(response.data);
      } else {
        const nomeUsuario = await AsyncStorage.getItem("nomeUsuario");
        const emailUsuario = await AsyncStorage.getItem("emailUsuario");
        if (nomeUsuario || emailUsuario) {
          setTutor({
            codigo_tutor: Number(codigoTutor),
            nome: nomeUsuario || "",
            email: emailUsuario || "",
          });
        } else {
          setErro(response.data?.erro || "Nao foi possivel carregar os dados.");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar tutor:", error);
      setErro("Nao foi possivel carregar os dados do tutor.");
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    carregarTutor();
  }, [carregarTutor]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarTutor();
    });

    return unsubscribe;
  }, [navigation, carregarTutor]);

  const handleExcluirConta = () => {
    if (!tutor?.codigo_tutor) {
      Alert.alert("Atencao", "Tutor nao identificado.");
      return;
    }

    Alert.alert(
      "Excluir conta",
      "Tem certeza que deseja excluir sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setExcluindo(true);
            try {
              const response = await axios.delete(
                `${API_URL}/tutor/${tutor.codigo_tutor}`
              );

              if (response.data?.erro) {
                Alert.alert("Erro", response.data.erro);
                return;
              }

              await AsyncStorage.multiRemove([
                "codigoTutor",
                "nomeUsuario",
                "emailUsuario",
                "petsList",
              ]);

              Alert.alert("Sucesso", "Conta excluida com sucesso!");
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Erro ao excluir conta:", error);
              Alert.alert("Erro", "Nao foi possivel excluir a conta.");
            } finally {
              setExcluindo(false);
            }
          },
        },
      ]
    );
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d4e9ff" />
          <Text style={styles.helperText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={styles.voltarText}>{"< Voltar"}</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.avatarGrande}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.nomeGrande}>{tutor?.nome || "Tutor"}</Text>
          <Text style={styles.subtitulo}>{tutor?.email || ""}</Text>
        </View>

        {erro ? <Text style={styles.helperText}>{erro}</Text> : null}

        <Pressable
          style={styles.editButton}
          onPress={() => navigation.navigate("EditarTutor", { tutorData: tutor })}
        >
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteButton, excluindo && styles.deleteButtonDisabled]}
          onPress={handleExcluirConta}
          disabled={excluindo}
        >
          <Text style={styles.deleteButtonText}>
            {excluindo ? "Excluindo..." : "Excluir conta"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#344759",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  voltar: {
    marginBottom: 16,
  },
  voltarText: {
    color: "#D4E9FF",
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarGrande: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#336699",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarIcon: {
    fontSize: 36,
  },
  nomeGrande: {
    fontSize: 24,
    fontFamily: "MuseoModerno-Bold",
    color: "#D4E9FF",
  },
  subtitulo: {
    fontSize: 14,
    color: "rgba(212, 233, 255, 0.6)",
  },
  helperText: {
    color: "rgba(212, 233, 255, 0.7)",
    fontFamily: "MuseoModerno-Regular",
    marginBottom: 16,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#336699",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  editButtonText: {
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#C64545",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
  },
});

export default PginaDeConfiguracaoTutor;
