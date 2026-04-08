import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CLASSIFICACOES = [
  "Antibiótico",
  "Anti-inflamatório",
  "Analgésico",
  "Antiparasitário",
  "Antialérgico",
  "Antifúngico",
  "Anticonvulsivante",
  "Corticoide",
  "Vitaminas",
  "Suplemento",
  "Outro",
];

const FREQUENCIAS = [
  "1x ao dia",
  "2x ao dia",
  "3x ao dia",
  "A cada 8 horas",
  "A cada 12 horas",
  "A cada 24 horas",
  "Semanal",
  "Quinzenal",
  "Mensal",
  "Conforme necessário",
];

type Pet = {
  codigo_pet: number;
  nome: string;
  especie?: string;
  raca?: string;
};

const PginaDeCadastroDeMedicamento = ({ navigation, route }) => {
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = React.useState<Pet | null>(null);
  const [nomeMedicamento, setNomeMedicamento] = React.useState("");
  const [classificacao, setClassificacao] = React.useState("");
  const [dataValidade, setDataValidade] = React.useState("");
  const [dosagem, setDosagem] = React.useState("");
  const [frequencia, setFrequencia] = React.useState("");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");
  const [showPetOptions, setShowPetOptions] = React.useState(false);
  const [showClassificacaoOptions, setShowClassificacaoOptions] = React.useState(false);
  const [showFrequenciaOptions, setShowFrequenciaOptions] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    carregarPets();
  }, []);

  React.useEffect(() => {
    if (route?.params?.petData) {
      setSelectedPet(route.params.petData);
    }
  }, [route?.params?.petData]);

  const carregarPets = async () => {
    try {
      const codigoTutor = await AsyncStorage.getItem("codigoTutor");
      if (!codigoTutor) {
        Alert.alert("Erro", "Tutor não identificado.");
        return;
      }

      const response = await axios.get(`${API_URL}/tutor/${codigoTutor}/perfil`);
      if (response.data?.pets) {
        setPets(response.data.pets);
      }
    } catch (erro) {
      console.error("Erro ao carregar pets:", erro);
      Alert.alert("Erro", "Não foi possível carregar os pets.");
    }
  };

  const formatarDataDigitada = (valor: string) => {
    const somenteNumeros = valor.replace(/\D/g, "").slice(0, 8);
    if (somenteNumeros.length <= 2) {
      return somenteNumeros;
    }
    if (somenteNumeros.length <= 4) {
      return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2)}`;
    }
    return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2, 4)}/${somenteNumeros.slice(4)}`;
  };

  const formatarDataParaISO = (valor) => {
    if (!valor) {
      return null;
    }

    const texto = String(valor).trim();
    if (!texto) {
      return null;
    }

    const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matchIso) {
      return texto;
    }

    const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (matchBr) {
      return `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`;
    }

    return null;
  };

  const obterMensagemErro = (erro: unknown) => {
    if (axios.isAxiosError(erro)) {
      const data = erro.response?.data;
      if (typeof data === "string") {
        return data;
      }
      if (data?.erro) {
        return data.erro;
      }
      if (data?.message) {
        return data.message;
      }
      if (erro.response?.status) {
        return `Erro ${erro.response.status}`;
      }
    }

    return "Não foi possível cadastrar o medicamento.";
  };

  const handleCancelar = () => {
    navigation.goBack();
  };

  const handleConfirmar = async () => {
    if (!API_URL) {
      Alert.alert("Erro", "API não configurada.");
      return;
    }

    if (!selectedPet?.codigo_pet) {
      Alert.alert("Atenção", "Selecione o pet.");
      return;
    }

    if (!nomeMedicamento.trim()) {
      Alert.alert("Atenção", "Informe o nome do medicamento.");
      return;
    }

    if (!classificacao) {
      Alert.alert("Atenção", "Selecione a classificação.");
      return;
    }

    if (!frequencia) {
      Alert.alert("Atenção", "Selecione a frequência.");
      return;
    }

    const validadeIso = formatarDataParaISO(dataValidade);
    if (dataValidade.trim() && !validadeIso) {
      Alert.alert("Atenção", "Data de validade inválida. Use DD/MM/AAAA.");
      return;
    }

    setSalvando(true);
    try {
      const response = await axios.post(`${API_URL}/medicamento`, {
        codigo_pet: Number(selectedPet.codigo_pet),
        nome: nomeMedicamento.trim(),
        classificacao,
        validade: validadeIso,
        dosagem: dosagem.trim() || null,
        frequencia,
      });

      if (response.data?.erro) {
        Alert.alert("Erro", response.data.erro);
        return;
      }

      Alert.alert("Sucesso", "Medicamento cadastrado com sucesso!");
      navigation.goBack();
    } catch (erro) {
      const mensagem = obterMensagemErro(erro);
      if (axios.isAxiosError(erro)) {
        console.error("Erro ao cadastrar medicamento:", {
          status: erro.response?.status,
          data: erro.response?.data,
        });
      } else {
        console.error("Erro ao cadastrar medicamento:", erro);
      }
      Alert.alert("Erro", mensagem);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleCancelar} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Cadastrar Medicamento</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Pet <Text style={styles.requiredMarker}>*</Text>
          </Text>
          <Pressable
            style={styles.inputRow}
            onPress={() => {
              setShowPetOptions((prev) => !prev);
              setShowClassificacaoOptions(false);
              setShowFrequenciaOptions(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedPet && styles.dropdownPlaceholder,
              ]}
            >
              {selectedPet ? selectedPet.nome : "Selecione o pet"}
            </Text>
            <Text style={styles.inputIcon}>▾</Text>
          </Pressable>
          {showPetOptions && (
            <View style={styles.dropdownMenu}>
              {pets.length === 0 ? (
                <View style={styles.dropdownOption}>
                  <Text style={styles.emptyOptionText}>
                    Nenhum pet encontrado
                  </Text>
                </View>
              ) : (
                pets.map((pet) => (
                  <Pressable
                    key={pet.codigo_pet}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedPet(pet);
                      setShowPetOptions(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{pet.nome}</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Nome do medicamento <Text style={styles.requiredMarker}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do medicamento"
            placeholderTextColor="rgba(212, 233, 255, 0.7)"
            value={nomeMedicamento}
            onChangeText={setNomeMedicamento}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Classificação <Text style={styles.requiredMarker}>*</Text>
          </Text>
          <Pressable
            style={styles.inputRow}
            onPress={() => {
              setShowClassificacaoOptions((prev) => !prev);
              setShowFrequenciaOptions(false);
              setShowPetOptions(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !classificacao && styles.dropdownPlaceholder,
              ]}
            >
              {classificacao || "Selecione a classificação"}
            </Text>
            <Text style={styles.inputIcon}>▾</Text>
          </Pressable>
          {showClassificacaoOptions && (
            <View style={styles.dropdownMenu}>
              {CLASSIFICACOES.map((item) => (
                <Pressable
                  key={item}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setClassificacao(item);
                    setShowClassificacaoOptions(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Data de validade</Text>
          <View style={[styles.inputRow, styles.inputDate]}>
            <Text style={styles.inputIconLeft}>📅</Text>
            <TextInput
              style={styles.inputField}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="rgba(212, 233, 255, 0.7)"
              value={dataValidade}
              onChangeText={(text) => setDataValidade(formatarDataDigitada(text))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Dosagem</Text>
          <TextInput
            style={styles.input}
            placeholder="Dosagem"
            placeholderTextColor="rgba(212, 233, 255, 0.7)"
            value={dosagem}
            onChangeText={setDosagem}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            Frequência <Text style={styles.requiredMarker}>*</Text>
          </Text>
          <Pressable
            style={styles.inputRow}
            onPress={() => {
              setShowFrequenciaOptions((prev) => !prev);
              setShowClassificacaoOptions(false);
              setShowPetOptions(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !frequencia && styles.dropdownPlaceholder,
              ]}
            >
              {frequencia || "Selecione a frequência"}
            </Text>
            <Text style={styles.inputIcon}>▾</Text>
          </Pressable>
          {showFrequenciaOptions && (
            <View style={styles.dropdownMenu}>
              {FREQUENCIAS.map((item) => (
                <Pressable
                  key={item}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setFrequencia(item);
                    setShowFrequenciaOptions(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Data de início</Text>
          <View style={[styles.inputRow, styles.inputDate]}>
            <Text style={styles.inputIconLeft}>📅</Text>
            <TextInput
              style={styles.inputField}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="rgba(212, 233, 255, 0.7)"
              value={dataInicio}
              onChangeText={(text) => setDataInicio(formatarDataDigitada(text))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Data de fim</Text>
          <View style={[styles.inputRow, styles.inputDate]}>
            <Text style={styles.inputIconLeft}>📅</Text>
            <TextInput
              style={styles.inputField}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="rgba(212, 233, 255, 0.7)"
              value={dataFim}
              onChangeText={(text) => setDataFim(formatarDataDigitada(text))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <Pressable
            style={[styles.button, styles.buttonCancel]}
            onPress={handleCancelar}
            disabled={salvando}
          >
            <Text style={styles.buttonCancelText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonConfirm]}
            onPress={handleConfirmar}
            disabled={salvando}
          >
            <Text style={styles.buttonConfirmText}>💊 Confirmar</Text>
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
    paddingTop: 28,
    paddingBottom: 32,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: "MuseoModerno-Regular",
    fontSize: 14,
    color: "#D4E9FF",
    marginBottom: 8,
  },
  requiredMarker: {
    color: "#F6B1B1",
  },
  input: {
    borderWidth: 2,
    borderColor: "#D4E9FF",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Regular",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D4E9FF",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
  },
  inputDate: {
    borderRadius: 12,
  },
  inputField: {
    flex: 1,
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Regular",
  },
  dropdownText: {
    flex: 1,
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Regular",
  },
  dropdownPlaceholder: {
    color: "rgba(212, 233, 255, 0.7)",
  },
  dropdownMenu: {
    borderWidth: 2,
    borderColor: "#D4E9FF",
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
    backgroundColor: "#344759",
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 233, 255, 0.2)",
  },
  dropdownOptionText: {
    color: "#D4E9FF",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 14,
  },
  emptyOptionText: {
    color: "rgba(212, 233, 255, 0.7)",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 14,
  },
  inputIcon: {
    color: "#D4E9FF",
    fontSize: 16,
    marginLeft: 8,
  },
  inputIconLeft: {
    color: "#D4E9FF",
    fontSize: 16,
    marginRight: 8,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 55,
    borderRadius: 17,
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
    fontSize: 18,
    fontFamily: "MuseoModerno-Bold",
  },
  buttonConfirmText: {
    color: "#344759",
    fontSize: 18,
    fontFamily: "MuseoModerno-Bold",
  },
});

export default PginaDeCadastroDeMedicamento;
