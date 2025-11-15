import apiClient from './apiClient';
import type { ICountry } from '../types/auth/Country';

interface LoginDTO {
  username: string;
  password: string;
}

interface RegistroRapidoDTO {
  nombreUsuario: string;
  email: string;
  password: string;
  pais: string;
}

// --- MÉTODOS DE API ---

const login = async (loginDTO: LoginDTO) => {
  const response = await apiClient.post('/auth/login', loginDTO);
  return response.data;
};

const registroRapido = async (registroDTO: RegistroRapidoDTO) => {
  const response = await apiClient.post('/auth/registro/rapido', registroDTO);
  return response.data;
};

const validarUsuario = async (username: string) => {
  const response = await apiClient.get('/auth/usuario/validar', {
    params: { usuario: username }
  });
  return response.data;
};

const fetchPaises = async (): Promise<ICountry[]> => {
  const response = await apiClient.get('/paises/');
  return response.data;
};

export const authService = {
  login,
  registroRapido,
  validarUsuario,
  fetchPaises
};