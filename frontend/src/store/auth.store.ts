import { create } from 'zustand';
import apiClient from '../service/apiClient';
import { jwtDecode } from '../utils/jwtDecode';



// --- 2. Definición de Tipos ---
interface AuthUser {
  sub: string;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// --- 3. Función de inicialización ---
// Esta función lee localStorage *una sola vez* al crear el store
const getInitialState = () => {
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) {
    try {
      const decodedUser = jwtDecode(storedToken);
      // Verificamos si el token ha expirado
      if (decodedUser.exp * 1000 > Date.now()) {
        // ¡IMPORTANTE! Actualiza apiClient al cargar
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        return {
          user: decodedUser as AuthUser,
          token: storedToken,
          isAuthenticated: true,
        };
      }
    } catch (e) {
      console.error("Token almacenado inválido:", e);
    }
  }
  // Estado por defecto si no hay token o es inválido
  localStorage.removeItem('authToken');
  return { user: null, token: null, isAuthenticated: false };
};

// --- 4. Creación del Store ---
export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(), // Estado inicial cargado desde localStorage
  isLoading: false, // Opcional: si la carga es síncrona, no necesitamos 'isLoading'

  login: (newToken: string) => {
    try {
      const decodedUser = jwtDecode(newToken);
      
      localStorage.setItem('authToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      set({ 
        user: decodedUser, 
        token: newToken, 
        isAuthenticated: true 
      });
      
    } catch (e) {
      console.error("Error en login:", e);
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
}));