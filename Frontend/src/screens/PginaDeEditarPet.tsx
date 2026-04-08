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
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const formatarDataBr = (valor: string | null | undefined) => {
  if (!valor) {
    return "";
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

const formatarDataParaISO = (valor: string) => {
  const texto = String(valor || "").trim();
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

const parseNumero = (valor: string) => {
  const texto = String(valor || "").trim();
  if (!texto) {
    return null;
  }

  const numero = Number(texto.replace(",", "."));
  if (Number.isNaN(numero)) {
    return null;
  }

  return numero;
};

const parseInteiro = (valor: string) => {
  const texto = String(valor || "").trim();
  if (!texto) {
    return null;
  }

  const numero = Number(texto);
  if (Number.isNaN(numero)) {
    return null;
  }

  return Math.trunc(numero);
};

const PginaDeEditarPet = ({ navigation, route }) => {
  const petData = route?.params?.petData;
  const [nome, setNome] = React.useState("");
  const [idade, setIdade] = React.useState("");
  const [especie, setEspecie] = React.useState("");
  const [peso, setPeso] = React.useState("");
  const [dataNascimento, setDataNascimento] = React.useState("");
  const [porte, setPorte] = React.useState("");
  const [raca, setRaca] = React.useState("");
  const [condicaoEspecial, setCondicaoEspecial] = React.useState("");
  const [quantidadeRacao, setQuantidadeRacao] = React.useState("");
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    if (!petData) {
      return;
    }

    setNome(petData.nome ?? "");
    setIdade(petData.idade != null ? String(petData.idade) : "");
    setEspecie(petData.especie ?? "");
    setPeso(petData.peso != null ? String(petData.peso) : "");
    setDataNascimento(formatarDataBr(petData.data_nascimento));
    setPorte(petData.porte ?? "");
    setRaca(petData.raca ?? "");
    setCondicaoEspecial(petData.condicao_especial ?? "");
    setQuantidadeRacao(
      petData.quantidade_racao != null ? String(petData.quantidade_racao) : ""
    );
  }, [petData]);

  const handleSalvar = async () => {
    if (!petData?.codigo_pet) {
      Alert.alert("Atencao", "Pet nao identificado.");
      return;
    }

    if (!nome.trim() || !especie.trim()) {
      Alert.alert("Atencao", "Nome e especie sao obrigatorios.");
      return;
    }

    const idadeNumero = parseInteiro(idade);
    if (idade.trim() && idadeNumero === null) {
      Alert.alert("Atencao", "Idade invalida.");
      return;
    }

    const pesoNumero = parseNumero(peso);
    if (peso.trim() && pesoNumero === null) {
      Alert.alert("Atencao", "Peso invalido.");
      return;
    }

    const racaoNumero = parseNumero(quantidadeRacao);
    if (quantidadeRacao.trim() && racaoNumero === null) {
      Alert.alert("Atencao", "Quantidade de racao invalida.");
      return;
    }

    const dataIso = formatarDataParaISO(dataNascimento);
    if (dataNascimento.trim() && !dataIso) {
      Alert.alert("Atencao", "Data de nascimento invalida. Use DD/MM/AAAA.");
      return;
    }

    setSalvando(true);
    try {
      const response = await axios.put(`${API_URL}/pet/${petData.codigo_pet}`, {
        nome: nome.trim(),
        idade: idadeNumero,
        especie: especie.trim(),
        peso: pesoNumero,
        data_nascimento: dataIso,
        porte: porte.trim() || null,
        raca: raca.trim() || null,
        condicao_especial: condicaoEspecial.trim() || null,
        quantidade_racao: racaoNumero,
      });

      if (response.data?.erro) {
        Alert.alert("Erro", response.data.erro);
        return;
      }

      Alert.alert("Sucesso", "Pet atualizado com sucesso!");
      navigation.goBack();
    } catch (erro) {
      console.error("Erro ao atualizar pet:", erro);
      Alert.alert("Erro", "Nao foi possivel atualizar o pet.");
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
        <Text style={styles.headerTitle}>Editar Pet</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do pet"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Especie *</Text>
        <TextInput
          style={styles.input}
          value={especie}
          onChangeText={setEspecie}
          placeholder="Cachorro, Gato, etc"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Raca</Text>
        <TextInput
          style={styles.input}
          value={raca}
          onChangeText={setRaca}
          placeholder="Ex: Labrador, SRD"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Porte</Text>
        <TextInput
          style={styles.input}
          value={porte}
          onChangeText={setPorte}
          placeholder="Pequeno, Medio, Grande"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={peso}
          onChangeText={setPeso}
          placeholder="Ex: 4,5"
          keyboardType="numeric"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Idade</Text>
        <TextInput
          style={styles.input}
          value={idade}
          onChangeText={setIdade}
          placeholder="Ex: 2"
          keyboardType="numeric"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Data de nascimento</Text>
        <TextInput
          style={styles.input}
          value={dataNascimento}
          onChangeText={setDataNascimento}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Condicao especial</Text>
        <TextInput
          style={styles.input}
          value={condicaoEspecial}
          onChangeText={setCondicaoEspecial}
          placeholder="Ex: alergias, dieta"
          placeholderTextColor="rgba(212,233,255,0.6)"
        />

        <Text style={styles.label}>Quantidade de racao</Text>
        <TextInput
          style={styles.input}
          value={quantidadeRacao}
          onChangeText={setQuantidadeRacao}
          placeholder="Ex: 0,3"
          keyboardType="numeric"
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

export default PginaDeEditarPet;
