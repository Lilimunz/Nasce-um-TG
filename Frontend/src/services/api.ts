import axios from "axios";

const apiUrl = 'https://nasce-um-tg.onrender.com';

if (!apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL não foi configurada. Defina a variável de ambiente para a URL do backend."
  );
}

const api = axios.create({
  baseURL: apiUrl.replace(/\/$/, ""),
});

export default api;
