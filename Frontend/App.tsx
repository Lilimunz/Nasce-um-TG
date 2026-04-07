import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useFonts } from "expo-font";
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from "react-native-safe-area-context";
import PginaDeLogIn from "./src/screens/PginaDeLogIn";
import PginaDeCadastro from "./src/screens/PginaDeCadastro";
import { PaginaPrincipal } from './src/screens/PginaPrincipal';
import PginaDeCadia from "./src/screens/PginaDeCadia";

const Stack = createStackNavigator()

export default function App() {
  const [fontsLoaded] = useFonts({
    "MuseoModerno-Regular": require("./assets/fonts/MuseoModerno-Regular.ttf"),
    "MuseoModerno-Bold": require("./assets/fonts/MuseoModerno-Bold.ttf"),
    "MuseoModerno-SemiBold": require("./assets/fonts/MuseoModerno-SemiBold.ttf"),
    "MuseoModerno-Medium": require("./assets/fonts/MuseoModerno-Medium.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Carregando fontes...</Text>;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* 'initialRouteName' define qual tela abre primeiro. Geralmente é o Login. */}
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={PginaDeLogIn} />
          <Stack.Screen name="Cadastro" component={PginaDeCadia} />
          <Stack.Screen name="CadastroPrincipal" component={PginaDeCadastro} />
          <Stack.Screen name="Home" component={PaginaPrincipal} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
