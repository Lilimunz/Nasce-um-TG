import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Image assets
const Calendario = require("../../assets/images/calendario.png");
const Localizacao = require("../../assets/images/maps.png");
const Patinha = require("../../assets/images/patinha.png");
const Configuracao = require("../../assets/images/config.png");
const Racao = require("../../assets/images/racao.png");

// Dados dos alimentos liberados
const alimentosLiberados = [
  {
    nome: "Abóbora",
    descricao:
      "Ofereça sempre sem a casca e como um petisco.",
  },
  {
    nome: "Beterraba",
    descricao:
      "Possui vitaminas A, B e C, e é ótima para aumentar a imunidade do pet. Caso seu amigo tenha diabetes, consulte um veterinário",
  },
  {
    nome: "Brócolis",
    descricao:
      "Sirva cozido e sem tempero. Alguns cachorros gostam de comer brócolis sozinho, outros preferem misturado na ração do dia a dia.",
  },
  {
    nome: "Cenoura",
    descricao:
      "Cães adoram este legume cozido e sem tempero! É muito indicado para cachorros em dieta, porque aumenta a sensação de saciedade, e possui vitaminas e fibras.",
  },
  {
    nome: "Maçã",
    descricao:
      "Para o seu cachorro aproveitar com mais tranquilidade, retire a casca, as sementes e o miolo.",
  },
  {
    nome: "Melancia",
    descricao:
      "Ideal para os tempos de calor, a melancia é muito refrescante e ajuda a manter seu pet hidratado. Retire a casca e as sementes, e seu cachorro vai adorar!",
  },
  {
    nome: "Morango",
    descricao:
      "Com poucas calorias e muitas vitaminas, os morangos estão liberados em pequenas quantidades, como um petisco.",
  },
];

// Dados dos alimentos restritos
const alimentosRestritos = [
  {
    nome: "Abacate",
    descricao:
      "Isso porque a fruta contém persina, que é uma substância venenosa para os pets. Vale lembrar que a persina está presente em todo o abacateiro, por isso, também não deixe o cão roer o tronco.",
  },
  {
    nome: "Alho e cebola",
    descricao:
      "os temperos favoritos da cozinha brasileira devem ficar longe do cachorro por conterem alicina, substância que pode causar anemia grave",
  },
  {
    nome: "Carambola",
    descricao:
      "Algumas toxinas naturais da fruta podem causar doenças renais, principalmente em animais com tendência a esses problemas. Portanto, é preciso evitá-la.",
  },
  {
    nome: "Chocolate",
    descricao:
      "Esse doce contém uma substância chamada teobromina, que pode causar diversos problemas, de vômito e diarreia a doenças no coração",
  },
  {
    nome: "Laranja e limão",
    descricao:
      "Apesar do limão ser opção saudável para os humanos, rico em vitamina C, ele é perigoso quando oferecido aos animais. O excesso de acidez pode causar gastrite e outras complicações no trato gástrico.",
  },
];

const TelaDeAlimentos = ({ navigation }) => {
  const [activeTab, setActiveTab] = React.useState<"liberados" | "restritos">(
    "liberados"
  );

  const alimentosAtuais =
    activeTab === "liberados" ? alimentosLiberados : alimentosRestritos;

  return (
    <SafeAreaView style={styles.container}>
      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Alimentos</Text>
      </View>

      {/* Abas */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "liberados" && styles.tabActive]}
          onPress={() => setActiveTab("liberados")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "liberados" && styles.tabTextActive,
            ]}
          >
            Liberados
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "restritos" && styles.tabActive]}
          onPress={() => setActiveTab("restritos")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "restritos" && styles.tabTextActive,
            ]}
          >
            Restritos
          </Text>
        </Pressable>
      </View>

      {/* Lista de Alimentos */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {alimentosAtuais.map((alimento, index) => (
          <View key={`${alimento.nome}-${index}`} style={styles.alimentoItem}>
            <Text style={styles.alimentoTexto}>
              <Text style={styles.alimentoNome}>{alimento.nome} - </Text>
              <Text style={styles.alimentoDescricao}>
                {alimento.descricao}
              </Text>
            </Text>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Image source={Calendario} style={styles.navIcon} />
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Image source={Localizacao} style={styles.navIcon} />
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Image source={Patinha} style={styles.navIcon} />
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Image source={Racao} style={styles.navIcon} />
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => navigation.navigate("ConfiguracaoTutor")}
        >
          <Image source={Configuracao} style={styles.navIcon} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#344759",
  },
  titleContainer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#344759",
  },
  title: {
    fontFamily: "MuseoModerno-Bold",
    fontSize: 22,
    color: "#D4E9FF",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#344759",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 233, 255, 0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#D4E9FF",
  },
  tabText: {
    fontFamily: "MuseoModerno-Regular",
    fontSize: 15,
    color: "rgba(212, 233, 255, 0.5)",
  },
  tabTextActive: {
    fontFamily: "MuseoModerno-Bold",
    color: "#D4E9FF",
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#344759",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  alimentoItem: {
    marginBottom: 24,
  },
  alimentoTexto: {
    fontSize: 14,
    lineHeight: 21,
    color: "#D4E9FF",
  },
  alimentoNome: {
    fontFamily: "MuseoModerno-Bold",
    fontSize: 14,
    color: "#D4E9FF",
  },
  alimentoDescricao: {
    fontFamily: "MuseoModerno-Regular",
    fontSize: 14,
    color: "#D4E9FF",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#d4e9ff",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "#336699",
    flexShrink: 0,
  },
  navItem: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navItemActive: {
    borderTopWidth: 3,
    borderTopColor: "#344759",
    marginTop: -3,
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});

export default TelaDeAlimentos;
