import api from "./api";
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
  const response = await api.get(
    `/lembretes/${codigoTutor}`
  );

  if (response.data?.erro) {
    throw new Error(response.data.erro);
  }

  return Array.isArray(response.data) ? response.data : [];
}

export async function criarLembrete(
  lembrete: NovoLembrete
): Promise<number> {
  const response = await api.post(
    `/lembrete`,
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
  const response = await api.delete(
    `/lembrete/${codigoLembrete}`
  );

  if (response.data?.erro) {
    throw new Error(response.data.erro);
  }
}