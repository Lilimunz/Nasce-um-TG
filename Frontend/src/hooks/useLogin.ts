import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export function useLogin(navigation: any) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [showSenha, setShowSenha] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID,
  });

useEffect(() => {
    const processarLoginGoogle = async () => {
      if (response?.type === 'success') {
        const token = response.authentication?.accessToken;
        
        try {
          // Passo A: Pede os dados do usuário para o Google usando o token
          const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const googleUser = await userInfoResponse.json();

          // Passo B: Manda o e-mail e nome para o backend
          const backendResponse = await axios.post(`${API_URL}/login-google`, {
            email: googleUser.email,
            nome: googleUser.name,
          });

          const dados = backendResponse.data;
          // Passo C: Se o backend devolver o codigo_tutor, salva a sessão e navega
          if (dados && dados.codigo_tutor) {
            await AsyncStorage.setItem('tutorId', String(dados.codigo_tutor));
            await AsyncStorage.setItem('codigoTutor', String(dados.codigo_tutor));
            await AsyncStorage.setItem('nomeUsuario', dados.nome);
            await AsyncStorage.setItem('emailUsuario', dados.email);

            Alert.alert("Sucesso!", dados.mensagem);
            navigation.replace("Home", { tutorId: dados.codigo_tutor });
          } else {
            Alert.alert("Erro", "Não foi possível registrar o usuário via Google.");
          }
        } catch (error) {
          console.error("Erro ao processar Google:", error);
          Alert.alert("Erro de Conexão", "Não foi possível validar o login com o Google.");
        }
      } else if (response?.type === 'error') {
        Alert.alert("Ops", "O login com o Google foi cancelado ou falhou.");
      }
    };
    processarLoginGoogle();
  }, [response]);

    // 2. Verifica a Sessão 
    useEffect(() => {
        const verificarSessao = async () => {
            try {
                const idSalvo = await AsyncStorage.getItem('tutorId');
                if (idSalvo !== null) {
                    navigation.replace("Home", { tutorId: idSalvo });
                }
            } catch (error) {
                console.error("Erro ao ler a sessão", error);
            }
        };
        verificarSessao();
    }, [navigation]);

    // 3. Função de Login
    const handleLogin = async () => {
        const emailNormalizado = email.trim().toLowerCase();
        const senhaNormalizada = senha;

        if (!emailNormalizado || !senhaNormalizada) {
            Alert.alert("Atenção", "Preencha todos os campos!");
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: emailNormalizado,
                senha: senhaNormalizada,
            });

            if (response.data === "senha inválida") {
                Alert.alert("Ops!", "Senha inválida. Tente novamente.");
                return;
            }
            if (response.data === "Usuário não encontrado") {
                Alert.alert("Ops!", "Usuário não encontrado.");
                return;
            }
            if (response.data === "Erro interno no login") {
                Alert.alert("Erro", "Não foi possível concluir o login.");
                return;
            }
            if (response.data && response.data.codigo_tutor !== undefined && response.data.codigo_tutor !== null) {
                await AsyncStorage.setItem('codigoTutor', String(response.data.codigo_tutor));
                if (response.data.nome) {
                    await AsyncStorage.setItem('nomeUsuario', String(response.data.nome));
                }
                await AsyncStorage.setItem('emailUsuario', emailNormalizado);
                try {
                    const perfilResponse = await axios.get(`${API_URL}/tutor/${response.data.codigo_tutor}/perfil`);
                    if (perfilResponse.data && perfilResponse.data.pets) {
                        await AsyncStorage.setItem('petsList', JSON.stringify(perfilResponse.data.pets));
                    }
                } catch (erroInterno) {
                    console.log("Aviso: Não foi possível carregar os pets no login, será carregado mais tarde:", erroInterno);
                }
            } else {
                try {
                    const usuarioResponse = await axios.get(`${API_URL}/usuario/${encodeURIComponent(emailNormalizado)}`)
                    if (usuarioResponse.data && usuarioResponse.data.nome) {
                        await AsyncStorage.setItem('nomeUsuario', usuarioResponse.data.nome);
                        await AsyncStorage.setItem('emailUsuario', emailNormalizado);
                        if (usuarioResponse.data.codigo_tutor !== undefined && usuarioResponse.data.codigo_tutor !== null) {
                            await AsyncStorage.setItem('codigoTutor', String(usuarioResponse.data.codigo_tutor));
                        } else {
                            Alert.alert("Erro", "Não foi possível recuperar o código do tutor.")
                            return;
                        }
                    } else {
                        Alert.alert("Erro", "Não foi possível recuperar os dados do usuário.")
                        return
                    }
                } catch (erro) {
                    console.log("Não foi possível recuperar dados do usuário:", erro);
                    Alert.alert("Erro", "Não foi possível recuperar o código do tutor.")
                    return;
                }
            }
            Alert.alert("Sucesso!", "Bem-vindo(a) ao Guia Pet!");
            const idDoTutor = response.data.codigo_tutor ?? response.data.tutor?.codigo_tutor;
            await AsyncStorage.setItem('tutorId', idDoTutor.toString())

            setEmail("")
            setSenha("")
            navigation.replace("Home", { tutorId: idDoTutor })
        } catch (erro) {
            console.error("Erro no login:", erro)
            Alert.alert("Erro de Conexão", "Não foi possível ligar ao servidor.")
        }
    };

    // 4. Funções de Navegação Secundárias
    const handleCadastro = () => {
        navigation.navigate("CadastroPrincipal")
    };

    const handleEsqueciSenha = () => {
        navigation.navigate("EsqueciSenha")
    };

    const handleHome = () => {
        navigation.navigate("Cadastro")
    };

    // 5. Retorna o que a interface visual vai precisar
    return {
        email,
        setEmail,
        senha,
        setSenha,
        showSenha,
        setShowSenha,
        handleLogin,
        handleCadastro,
        handleEsqueciSenha,
        handleHome,
        promptAsync // Exportamos a função que "chama" o Google
    };
}