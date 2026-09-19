import * as React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Calendario from "../../assets/images/calendario.png";
import Localizacao from "../../assets/images/maps.png";
import Patinha from "../../assets/images/patinha.png";
import Configuracao from "../../assets/images/config.png";
import Racao from "../../assets/images/racao.png";

type Props = {
  navigation: any;
  active?: "agenda" | "locais" | "pets" | "alimentos" | "config";
};

export default function BarraNavegacao({
  navigation,
  active,
}: Props) {
  const items = [
    {
      key: "agenda",
      route: "Agenda",
      image: Calendario,
    },
    {
      key: "locais",
      route: "Hospitais",
      image: Localizacao,
    },
    {
      key: "pets",
      route: "Home",
      image: Patinha,
    },
    {
      key: "alimentos",
      route: "Alimentos",
      image: Racao,
    },
    {
      key: "config",
      route: "ConfiguracaoTutor",
      image: Configuracao,
    },
  ] as const;

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          style={[
            styles.item,
            active === item.key && styles.itemActive,
          ]}
          onPress={() => navigation.navigate(item.route)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${item.key}`}
        >
          <Image source={item.image} style={styles.icon} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#D4E9FF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "#336699",
  },
  item: {
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemActive: {
    borderTopWidth: 3,
    borderTopColor: "#344759",
    marginTop: -3,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});