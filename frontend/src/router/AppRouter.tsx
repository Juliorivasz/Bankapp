import { Route, Routes } from "react-router-dom"
import { LayoutClient } from "../components/layout/client/LayoutClient"
import LandingPage from "../pages/Landing-page"
import LoginPage from "../pages/Login-page"
import RegisterPage from "../pages/Register-page"
import FeaturesPage from "../pages/Features-page"
import SecurityPage from "../pages/Security-page"
import AboutPage from "../pages/About-page"
import VerifyPage from "../pages/VerifyPage"

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verificar" element={<VerifyPage  />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  )
}
