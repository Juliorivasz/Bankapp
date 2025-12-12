import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { jwtDecode } from '../../utils/jwtDecode';
import { SessionTimeoutModal } from './SessionTimeoutModal';
import { authService } from '../../service/auth.service';
import { toast } from 'react-toastify';

const WARNING_THRESHOLD = 60; // Mostrar advertencia 60 segundos antes
const CHECK_INTERVAL = 5000; // Chequear cada 5 segundos

export const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const { token, logout, login } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Referencias para manejar intervalos
  const checkIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const checkTokenExpiration = useCallback(() => {
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return;

      const currentTime = Math.floor(Date.now() / 1000);
      const secondsLeft = decoded.exp - currentTime;

      // Si el token ya expiró
      if (secondsLeft <= 0) {
        handleLogout(true);
        return;
      }

      // Si queda menos tiempo del umbral y el modal no está abierto
      if (secondsLeft <= WARNING_THRESHOLD && !showModal) {
        setShowModal(true);
        setTimeLeft(secondsLeft);
      }
    } catch (error) {
      console.error("Error al decodificar token:", error);
      handleLogout();
    }
  }, [token, showModal]);

  // Efecto para verificar el token periódicamente
  useEffect(() => {
    if (!token) {
      setShowModal(false);
      return;
    }

    checkIntervalRef.current = setInterval(checkTokenExpiration, CHECK_INTERVAL);
    
    // Verificación inicial inmediata
    checkTokenExpiration();

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [token, checkTokenExpiration]);

  // Efecto para manejar el contador regresivo cuando el modal está abierto
  useEffect(() => {
    if (showModal && token) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showModal, token]);

  const handleLogout = (expired = false) => {
    logout();
    setShowModal(false);
    if (expired) {
      toast.info("Tu sesión ha expirado.");
    }
  };

  const handleExtendSession = async () => {
    try {
      const data = await authService.refreshToken();
      if (data && data.token) {
        login(data.token);
        setShowModal(false);
        toast.success("Sesión extendida exitosamente.");
      }
    } catch (error) {
      console.error("Error extendiendo sesión:", error);
      toast.error("No se pudo extender la sesión. Por favor, inicia sesión nuevamente.");
      handleLogout();
    }
  };

  return (
    <>
      {children}
      <SessionTimeoutModal 
        isOpen={showModal} 
        timeLeft={timeLeft} 
        onExtend={handleExtendSession} 
        onLogout={() => handleLogout()} 
      />
    </>
  );
};
