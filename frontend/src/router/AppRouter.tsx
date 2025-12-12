import { Route, Routes } from "react-router-dom"
import { LayoutClient } from "../components/layout/client/LayoutClient"
import LayoutDashboard from "../components/layout/dashboard/LayoutDashboard"
import LandingPage from "../pages/Landing-page"
import LoginPage from "../pages/Login-page"
import RegisterPage from "../pages/Register-page"
import FeaturesPage from "../pages/Features-page"
import SecurityPage from "../pages/Security-page"
import AboutPage from "../pages/About-page"
import VerifyPage from "../pages/VerifyPage"
import { PublicOnlyRoute } from "./PublicOnlyRoute"
import { PrivateRoute } from "./PrivateRoute"
import DashboardPage from "../pages/admin/DashboardPage"
import WalletsPage from "../pages/client/WalletsPage"
import TransactionsPage from "../pages/admin/TransactionsPage"
import ProfilePage from "../pages/admin/ProfilePage"
import SettingsPage from "../pages/admin/SettingsPage"
import Navbar from "../components/layout/Navbar"
import TransferPage from "../pages/client/TransferPage"
import { SessionManager } from "../components/auth/SessionManager"

export const AppRouter = () => {
  return (
    <Routes>
      {/* --- Rutas Públicas con LayoutClient (CON Footer) --- */}
      <Route path="/" element={<LayoutClient />}>
        {/* Si ya está logueado, la landing lo redirige al dashboard */}
        <Route element={<PublicOnlyRoute />}>
           <Route index element={<LandingPage />} />
        </Route>
        
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* --- Rutas de Autenticación (SIN Footer, solo Navbar) --- */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={
          <>
            <Navbar />
            <LoginPage />
          </>
        } />
        <Route path="/register" element={
          <>
            <Navbar />
            <RegisterPage />
          </>
        } />
        <Route path="/verificar" element={
          <>
            <Navbar />
            <VerifyPage />
          </>
        } />
      </Route>

      {/* --- Rutas Privadas con LayoutDashboard (CON Sidebar, SIN Footer) --- */}
      <Route element={<PrivateRoute allowedRoles={['ROLE_CLIENTE']} />}>
        <Route element={
          <SessionManager>
            <LayoutDashboard />
          </SessionManager>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wallets" element={<WalletsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transferir" element={<TransferPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
