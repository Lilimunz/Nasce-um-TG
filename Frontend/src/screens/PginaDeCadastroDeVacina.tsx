import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CalendarIcon = "📅";

interface Pet {
  codigo_pet: number;
  nome: string;
  especie: string;
  raca?: string;
}

const PginaDeCadastroDeVacina = ({ navigation, route }) => {
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = React.useState<Pet | null>(null);
  const [nomeVacina, setNomeVacina] = React.useState("");
  const [tipoVacina, setTipoVacina] = React.useState("");
  const [dataAplicacao, setDataAplicacao] = React.useState(new Date());
  const [dataAplicacaoText, setDataAplicacaoText] = React.useState(
    new Date().toLocaleDateString("pt-BR")
  );
  const [showPetDropdown, setShowPetDropdown] = React.useState(false);
  const [showTipoDropdown, setShowTipoDropdown] = React.useState(false);
  const [carregando, setCarregando] = React.useState(false);

  const TIPOS_VACINA = [
    "Raiva",
    "V8",
    "V10",
    "Gripe",
    "Leishmaniose",
    "Giardíase",
    "Leptospirose",
    "Parvovírus",
    "Cinomose",
    "Outra",
  ];

  // Carregar pets ao montar o componente
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
        Alert.alert("Erro", "Tutor não identificado");
        return;
      }

      const response = await axios.get(`${API_URL}/tutor/${codigoTutor}/perfil`);
      if (response.data && response.data.pets) {
        setPets(response.data.pets);
      }
    } catch (erro) {
      console.error("Erro ao carregar pets:", erro);
      Alert.alert("Erro", "Não foi possível carregar os pets");
    }
  };

  const handleDateChange = (text: string) => {
    setDataAplicacaoText(text);
    // Try to parse the date in DD/MM/YYYY format
    const parts = text.split("/");
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      const dia = parseInt(parts[0]);
      const mes = parseInt(parts[1]) - 1;
      const ano = parseInt(parts[2]);
      const data = new Date(ano, mes, dia);
      if (!isNaN(data.getTime())) {
        setDataAplicacao(data);
      }
    }
  };

  const handleConfirmar = async () => {
    if (!selectedPet || !nomeVacina.trim() || !tipoVacina) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios!");
      return;
    }

    setCarregando(true);
    try {
      const response = await axios.post(`${API_URL}/vacina`, {
        codigo_pet: selectedPet.codigo_pet,
        nome: nomeVacina,
        tipo: tipoVacina,
        data_aplicacao: dataAplicacao.toISOString().split("T")[0],
      });

      if (response.data && !response.data.erro) {
        Alert.alert("Sucesso", "Vacina cadastrada com sucesso!");
        // Limpar formulário
        setSelectedPet(null);
        setNomeVacina("");
        setTipoVacina("");
        setDataAplicacao(new Date());
        // Voltar à tela anterior
        navigation.goBack();
      } else {
        Alert.alert("Erro", response.data?.erro || "Erro ao cadastrar vacina");
      }
    } catch (erro) {
      console.error("Erro ao cadastrar vacina:", erro);
      Alert.alert("Erro", "Não foi possível cadastrar a vacina");
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelar = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancelar} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Cadastrar Vacina</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Form Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pet Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Selecione o pet</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setShowPetDropdown(!showPetDropdown)}
          >
            <Text style={styles.dropdownText}>
              {selectedPet ? selectedPet.nome : "Selecione o pet"}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </Pressable>

          {showPetDropdown && (
            <View style={styles.dropdownMenu}>
              {pets.map((pet) => (
                <Pressable
                  key={pet.codigo_pet}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setSelectedPet(pet);
                    setShowPetDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedPet?.codigo_pet === pet.codigo_pet &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {pet.nome}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Nome da Vacina */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Nome da vacina</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da vacina"
            placeholderTextColor="#888"
            value={nomeVacina}
            onChangeText={setNomeVacina}
          />
        </View>

        {/* Tipo da Vacina */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Tipo da vacina</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setShowTipoDropdown(!showTipoDropdown)}
          >
            <Text style={styles.dropdownText}>
              {tipoVacina || "Selecione o tipo"}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </Pressable>

          {showTipoDropdown && (
            <View style={styles.dropdownMenu}>
              {TIPOS_VACINA.map((tipo) => (
                <Pressable
                  key={tipo}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setTipoVacina(tipo);
                    setShowTipoDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      tipoVacina === tipo && styles.selectedOptionText,
                    ]}
                  >
                    {tipo}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Data de Aplicação */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Data de aplicação</Text>
          <View style={styles.dateInputContainer}>
            <Text style={styles.calendarIcon}>{CalendarIcon}</Text>
            <TextInput
              style={styles.dateInputField}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#888"
              value={dataAplicacaoText}
              onChangeText={handleDateChange}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={styles.cancelButton}
            onPress={handleCancelar}
            disabled={carregando}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmButton, carregando && styles.buttonDisabled]}
            onPress={handleConfirmar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#344759" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>✓ Confirmar</Text>
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
    backgroundColor: "#d4e9ff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#344759",
    fontSize: 24,
  },
  headerTitle: {
    fontFamily: "MuseoModerno-Bold",
    fontSize: 20,
    color: "#344759",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: "MuseoModerno-Regular",
    fontSize: 16,
    color: "#d4e9ff",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#d4e9ff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#d4e9ff",
    fontFamily: "MuseoModerno-Regular",
    fontSize: 16,
    backgroundColor: "transparent",
  },
  dropdown: {
    borderWidth: 2,
    borderColor: "#d4e9ff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontFamily: "MuseoModerno-Regular",
    fontSize: 16,
    color: "#d4e9ff",
  },
  chevron: {
    color: "#d4e9ff",
    fontSize: 12,
  },
  dropdownMenu: {
    borderWidth: 2,
    borderColor: "#d4e9ff",
    borderRadius: 8,
    backgroundColor: "rgba(52, 71, 89, 0.95)",
    marginTop: 4,
    maxHeight: 250,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 233, 255, 0.1)",
  },
  dropdownOptionText: {
    fontFamily: "MuseoModerno-Regular",
    fontSize: 14,
    color: "#d4e9ff",
  },
  selectedOptionText: {
    fontFamily: "MuseoModerno-Bold",
    color: "#336699",
  },
  dateInputContainer: {
    borderWidth: 2,
    borderColor: "#d4e9ff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateInputField: {
    flex: 1,
    fontFamily: "MuseoModerno-Regular",
    fontSize: 16,
    color: "#d4e9ff",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#336699",
    borderRadius: 17,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#d4e9ff",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#d4e9ff",
    borderRadius: 17,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#344759",
    fontFamily: "MuseoModerno-Bold",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default PginaDeCadastroDeVacina;
