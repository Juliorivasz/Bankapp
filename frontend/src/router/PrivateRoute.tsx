import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const FullScreenLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[var(--color-background)]">
    <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
  </div>
);

/**
 * RUTAS PRIVADAS:
 * - /dashboard, /perfil, /wallets
 * - Si el usuario NO está logueado, lo redirige al /login.
 * - Si está logueado, comprueba sus roles.
 */
interface PrivateRouteProps {
  allowedRoles?: string[]; // Ej: ["ROLE_CLIENTE", "ROLE_ADMIN"]
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user, isProfileComplete } = useAuthStore();
  const location = useLocation();

  // 1. Espera a que el store verifique el token
  if (isLoading) {
    return <FullScreenLoader />;
  }

  // 2. Si NO está logueado, lo mandamos a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Verificación de Perfil Completo
  // Si el perfil está incompleto y NO estamos en /complete-profile, redirigir
  if (!isProfileComplete && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Si el perfil YA está completo y tratamos de entrar a /complete-profile, redirigir al dashboard
  if (isProfileComplete && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Verificación de Roles (si se especifican)
  if (allowedRoles && user) {
    // Comprueba si el array de roles del usuario incluye AL MENOS UNO de los roles permitidos
    const hasRole = allowedRoles.some(role => user.roles.includes(role));
    
    if (!hasRole) {
      // Está logueado, pero no tiene permisos.
      // Puedes crear una página /unauthorized o simplemente redirigirlo.
      return <Navigate to="/dashboard" replace />; 
    }
  }

  // 5. Si está logueado y tiene los roles, muestra la página protegida.
  return <Outlet />;
};