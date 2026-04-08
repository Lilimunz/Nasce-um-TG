import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

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

const formatarData = (valor) => {
  if (!valor) {
    return "Data não informada";
  }

  const texto = String(valor);
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const data = new Date(valor);
  if (!Number.isNaN(data.getTime())) {
    return data.toLocaleDateString("pt-BR");
  }

  return texto;
};

const PetProfile = ({ route, navigation }) => {
  const petData = route.params?.petData;
  const [pet, setPet] = React.useState(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState('');
  const [vacinas, setVacinas] = React.useState([]);
  const [carregandoVacinas, setCarregandoVacinas] = React.useState(true);
  const [erroVacinas, setErroVacinas] = React.useState('');
  const [excluindo, setExcluindo] = React.useState(false);

  const carregarDadosPet = React.useCallback(async () => {
    if (!petData || !petData.codigo_pet) {
      setErro('Pet não especificado');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      const response = await axios.get(`${API_URL}/pet/${petData.codigo_pet}`);
      if (response.data && !response.data.erro) {
        setPet(response.data);
        setErro('');
      } else {
        setErro(response.data?.erro || 'Erro ao carregar dados do pet');
        setPet(null);
      }
    } catch (erro) {
      console.error('Erro ao buscar pet:', erro);
      setErro('Não foi possível carregar os dados do pet');
      setPet(null);
    } finally {
      setCarregando(false);
    }
  }, [petData]);

  const carregarVacinas = React.useCallback(async () => {
    if (!petData || !petData.codigo_pet) {
      setErroVacinas('Pet não especificado');
      setCarregandoVacinas(false);
      return;
    }

    setCarregandoVacinas(true);
    setErroVacinas('');
    try {
      const response = await axios.get(
        `${API_URL}/pet/${petData.codigo_pet}/vacinas`
      );

      if (Array.isArray(response.data)) {
        setVacinas(response.data);
      } else if (response.data?.erro) {
        setErroVacinas(response.data.erro);
        setVacinas([]);
      } else {
        setVacinas([]);
      }
    } catch (erro) {
      console.error('Erro ao buscar vacinas:', erro);
      setErroVacinas('Não foi possível carregar histórico de vacinas');
      setVacinas([]);
    } finally {
      setCarregandoVacinas(false);
    }
  }, [petData]);

  React.useEffect(() => {
    carregarDadosPet();
    carregarVacinas();
  }, [carregarDadosPet, carregarVacinas]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDadosPet();
      carregarVacinas();
    });

    return unsubscribe;
  }, [navigation, carregarVacinas]);

  const handleExcluirPet = () => {
    const codigoPet = pet?.codigo_pet || petData?.codigo_pet;

    if (!codigoPet) {
      Alert.alert("Atenção", "Pet não identificado.");
      return;
    }

    Alert.alert(
      "Excluir pet",
      "Tem certeza que deseja excluir este pet?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setExcluindo(true);
            try {
              const response = await axios.delete(`${API_URL}/pet/${codigoPet}`);
              if (response.data?.erro) {
                Alert.alert("Erro", response.data.erro);
                return;
              }
              Alert.alert("Sucesso", "Pet excluído com sucesso!");
              navigation.navigate("Home");
            } catch (erro) {
              console.error('Erro ao excluir pet:', erro);
              Alert.alert("Erro", "Não foi possível excluir o pet.");
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
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (erro) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.voltar}>
            <Text style={{ color: "#D4E9FF", fontSize: 16 }}>{"< Voltar"}</Text>
          </Pressable>
          <Text style={styles.errorText}>{erro}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!pet) return <Text style={{ color: '#d4e9ff' }}>Carregando...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        
        {/* Voltar */}
        <Pressable onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={{ color: "#D4E9FF", fontSize: 16 }}>{"< Voltar"}</Text>
        </Pressable>

        {/* Pet */}
        <View style={styles.header}>
          <View style={styles.avatarGrande}>
            <Text style={{ fontSize: 40 }}>{getPetEmoji(pet.especie)}</Text>
          </View>
          <Text style={styles.nomeGrande}>{pet.nome}</Text>
          <Text style={styles.subtitulo}>{pet.especie}{pet.raca ? ` · ${pet.raca}` : ""}</Text>
        </View>

        <View style={styles.editButtonContainer}>
          <Pressable
            style={styles.editButton}
            onPress={() => navigation.navigate('EditarPet', { petData: pet })}
          >
            <Text style={styles.editButtonText}>Editar dados</Text>
          </Pressable>
        </View>

        {/* Infos */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>{pet.peso ? `${pet.peso} kg` : "Não informado"}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Porte</Text>
            <Text style={styles.infoValue}>{pet.porte || "Não informado"}</Text>
          </View>
        </View>

        {/* Infos extras */}
        {pet.sexo && (
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Sexo</Text>
              <Text style={styles.infoValue}>{pet.sexo}</Text>
            </View>
            <View style={{ width: "48%" }} />
          </View>
        )}

        {/* Acoes */}
        <View style={styles.acoesGrid}>
          <Pressable
            style={styles.btnAcao}
            onPress={() => navigation.navigate('CadastroVacina', { petData: pet })}
          >
            <Text style={styles.btnAcaoIcon}>💉</Text>
            <Text style={styles.btnAcaoText}>Vacinas</Text>
          </Pressable>
          <Pressable
            style={styles.btnAcao}
            onPress={() => navigation.navigate('CadastroMedicamento', { petData: pet })}
          >
            <Text style={styles.btnAcaoIcon}>💊</Text>
            <Text style={styles.btnAcaoText}>Remédios</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Histórico de Vacinas</Text>
          <Pressable
            style={styles.sectionButton}
            onPress={() => navigation.navigate('CadastroVacina', { petData: pet })}
          >
            <Text style={styles.sectionButtonText}>Cadastrar vacina</Text>
          </Pressable>
        </View>

        {carregandoVacinas ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color="#d4e9ff" />
            <Text style={styles.inlineLoaderText}>Carregando vacinas...</Text>
          </View>
        ) : null}

        {!carregandoVacinas && erroVacinas ? (
          <Text style={styles.helperText}>{erroVacinas}</Text>
        ) : null}

        {!carregandoVacinas && !erroVacinas && vacinas.length === 0 ? (
          <Text style={styles.helperText}>Nenhuma vacina cadastrada.</Text>
        ) : null}

        {!carregandoVacinas && vacinas.length > 0 ? (
          <View style={styles.vacinasList}>
            {vacinas.map((vacina) => (
              <View
                key={vacina.codigo_vacina ?? `${vacina.nome}-${vacina.data_aplicacao}`}
                style={styles.vacinaCard}
              >
                <View style={styles.vacinaIconBox}>
                  <Text style={{ fontSize: 20 }}>💉</Text>
                </View>
                <View style={styles.vacinaInfo}>
                  <Text style={styles.vacinaNome}>{vacina.nome}</Text>
                  <Text style={styles.vacinaTipo}>{vacina.tipo}</Text>
                </View>
                <Text style={styles.vacinaData}>{formatarData(vacina.data_aplicacao)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.deleteSection}>
          <Pressable
            style={[styles.deleteButton, excluindo && styles.deleteButtonDisabled]}
            onPress={handleExcluirPet}
            disabled={excluindo}
          >
            <Text style={styles.deleteButtonText}>
              {excluindo ? "Excluindo..." : "Excluir Pet"}
            </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#d4e9ff",
    marginTop: 12,
    fontFamily: "MuseoModerno-Regular",
  },
  errorText: {
    color: "#d4e9ff",
    fontFamily: "MuseoModerno-Regular",
    marginTop: 20,
  },

  voltar: {
    marginBottom: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
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
  nomeGrande: {
    fontSize: 28,
    fontFamily: "MuseoModerno-Bold",
    color: "#D4E9FF",
  },
  subtitulo: {
    fontSize: 16,
    color: "rgba(212, 233, 255, 0.5)",
  },

  editButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#336699",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  editButtonText: {
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 14,
  },

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: "rgba(51, 102, 153, 0.15)",
    padding: 15,
    borderRadius: 12,
    width: "48%",
    borderWidth: 1,
    borderColor: "rgba(212, 233, 255, 0.08)",
  },
  infoLabel: {
    color: "rgba(212, 233, 255, 0.5)",
    fontSize: 12,
    marginBottom: 5,
  },
  infoValue: {
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 14,
  },

  acoesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 24,
  },
  btnAcao: {
    alignItems: "center",
    backgroundColor: "rgba(51, 102, 153, 0.15)",
    paddingVertical: 10,
    borderRadius: 12,
    width: "48%",
  },
  btnAcaoIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  btnAcaoText: {
    color: "#D4E9FF",
    fontSize: 10,
    fontFamily: "MuseoModerno-Medium",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#D4E9FF",
    fontSize: 18,
    fontFamily: "MuseoModerno-Bold",
  },
  sectionButton: {
    backgroundColor: "#336699",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sectionButtonText: {
    color: "#D4E9FF",
    fontSize: 12,
    fontFamily: "MuseoModerno-Bold",
  },

  helperText: {
    color: "rgba(212, 233, 255, 0.7)",
    fontSize: 12,
    marginBottom: 12,
    fontFamily: "MuseoModerno-Regular",
  },
  inlineLoader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  inlineLoaderText: {
    color: "rgba(212, 233, 255, 0.7)",
    fontSize: 12,
    marginLeft: 8,
    fontFamily: "MuseoModerno-Regular",
  },
  vacinasList: {
    marginTop: 4,
  },
  vacinaCard: {
    flexDirection: "row",
    backgroundColor: "rgba(51, 102, 153, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 233, 255, 0.12)",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  vacinaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(51, 102, 153, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vacinaInfo: {
    flex: 1,
  },
  vacinaNome: {
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 15,
  },
  vacinaTipo: {
    color: "rgba(212, 233, 255, 0.6)",
    fontSize: 12,
  },
  vacinaData: {
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 12,
  },

  deleteSection: {
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 24,
  },
  deleteButton: {
    backgroundColor: "#C64545",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 16,
    minWidth: 180,
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

export default PetProfile;