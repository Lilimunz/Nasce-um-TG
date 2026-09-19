import axios from "axios";
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB || "http://localhost:3000"
    : process.env.EXPO_PUBLIC_API_MAPS || "http://10.0.2.2:3000";

export type LembreteApi = {
  codigo_lembrete: number;
  codigo_pet: number;
  pet_nome: string;
  categoria: string;
  observacao: string;
  data: string;
  horario: string;
};

export type NovoLembrete = {
  codigo_pet: number;
  categoria: string;
  observacao?: string;
  data: string;
  horario: string;
};

export async function listarLembretes(
  codigoTutor: string
): Promise<LembreteApi[]> {
  const response = await axios.get(
    `${API_URL}/lembretes/${codigoTutor}`
  );

  if (response.data?.erro) {
    throw new Error(response.data.erro);
  }

  return Array.isArray(response.data) ? response.data : [];
}

export async function criarLembrete(
  lembrete: NovoLembrete
): Promise<number> {
  const response = await axios.post(
    `${API_URL}/lembrete`,
    lembrete
  );

  if (response.data?.erro) {
    throw new Error(response.data.erro);
  }

  return Number(response.data.codigo_lembrete);
}

export async function removerLembrete(
  codigoLembrete: number
): Promise<void> {
  const response = await axios.delete(
    `${API_URL}/lembrete/${codigoLembrete}`
  );

  if (response.data?.erro) {
    throw new Error(response.data.erro);
  }
}