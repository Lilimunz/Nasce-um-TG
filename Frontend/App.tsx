import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PginaDeLogIn from "./src/screens/PginaDeLogIn";
import PginaDeCadastro from "./src/screens/PginaDeCadastro";

export default function App() {
  
  const [fontsLoaded] = useFonts({
    "MuseoModerno-Regular": require("./assets/fonts/MuseoModerno-Regular.ttf"),
    "MuseoModerno-Bold": require("./assets/fonts/MuseoModerno-Bold.ttf"),
    "MuseoModerno-SemiBold": require("./assets/fonts/MuseoModerno-SemiBold.ttf"),
    "MuseoModerno-Medium": require("./assets/fonts/MuseoModerno-Medium.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Carregando fontes...</Text>; // ou null
  }
  return (
    <SafeAreaProvider>
      <PginaDeLogIn />
    </SafeAreaProvider>
  );
}

