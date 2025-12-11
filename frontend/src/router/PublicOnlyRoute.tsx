import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { FullScreenLoader } from "./PrivateRoute";

/**
 * RUTAS SÓLO PÚBLICAS:
 * - /login, /register, /verificar
 * - Si el usuario YA está logueado, lo redirige al dashboard.
 * - Si no está logueado, le permite ver la página.
 */
export const PublicOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // 1. Espera a que el store verifique el token de localStorage
  if (isLoading) {
    return <FullScreenLoader />;
  }

  // 2. Si está logueado, no debe ver /login. Lo mandamos al dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />; // 'replace' evita que pueda volver atrás
  }

  // 3. Si no está logueado, muestra la página (Login, Register, etc.)
  return <Outlet />;
};