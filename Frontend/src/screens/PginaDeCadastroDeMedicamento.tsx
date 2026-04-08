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

const PginaDeCadastroDeMedicamento = ({ navigation, route }) => {
  const [nomeMedicamento, setNomeMedicamento] = React.useState("");
  const [classificacao, setClassificacao] = React.useState("");
  const [dataValidade, setDataValidade] = React.useState("");
  const [dosagem, setDosagem] = React.useState("");
  const [frequencia, setFrequencia] = React.useState("");
  const [dataInicio, setDataInicio] = React.useState("");
  const [dataFim, setDataFim] = React.useState("");
  const [showClassificacaoOptions, setShowClassificacaoOptions] = React.useState(false);
  const [showFrequenciaOptions, setShowFrequenciaOptions] = React.useState(false);
  const [selectedPet, setSelectedPet] = React.useState(null);
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (route?.params?.petData) {
      setSelectedPet(route.params.petData);
    }
  }, [route?.params?.petData]);

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

  const handleCancelar = () => {
    navigation.goBack();
  };

  const handleConfirmar = async () => {
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

    if (!selectedPet?.codigo_pet) {
      Alert.alert("Atenção", "Pet não identificado. Volte e tente novamente.");
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
      console.error("Erro ao cadastrar medicamento:", erro);
      Alert.alert("Erro", "Não foi possível cadastrar o medicamento.");
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
          <TextInput
            style={styles.input}
            placeholder="Nome do medicamento"
            placeholderTextColor="rgba(212, 233, 255, 0.7)"
            value={nomeMedicamento}
            onChangeText={setNomeMedicamento}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Pressable
            style={styles.inputRow}
            onPress={() => {
              setShowClassificacaoOptions((prev) => !prev);
              setShowFrequenciaOptions(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !classificacao && styles.dropdownPlaceholder,
              ]}
            >
              {classificacao || "Classificação"}
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
          <View style={[styles.inputRow, styles.inputDate]}>
            <Text style={styles.inputIconLeft}>📅</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Data de validade"
              placeholderTextColor="rgba(212, 233, 255, 0.7)"
              value={dataValidade}
              onChangeText={setDataValidade}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <TextInput
            style={styles.input}
            placeholder="Dosagem"
            placeholderTextColor="rgba(212, 233, 255, 0.7)"
            value={dosagem}
            onChangeText={setDosagem}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Pressable
            style={styles.inputRow}
            onPress={() => {
              setShowFrequenciaOptions((prev) => !prev);
              setShowClassificacaoOptions(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !frequencia && styles.dropdownPlaceholder,
              ]}
            >
              {frequencia || "Frequência"}
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
          <View style={[styles.inputRow, styles.inputDate]}>
            <Text style={styles.inputIconLeft}>📅</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Data de início"
              placeholderTextColor="rgba(212, 233, 255, 0.7)"
              value={dataInicio}
              onChangeText={setDataInicio}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <View style={[styles.inputRow, styles.inputDate]}>
            <Text style={styles.inputIconLeft}>📅</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Data de fim"
              placeholderTextColor="rgba(212, 233, 255, 0.7)"
              value={dataFim}
              onChangeText={setDataFim}
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
