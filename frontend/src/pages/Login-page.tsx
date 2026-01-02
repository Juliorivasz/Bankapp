"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import Navbar from "../components/layout/Navbar"
import fondoLogin from "/fondo_wallet.webp"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { authService } from "../service/auth.service"
import { ExceptionAlert } from "../utils/exceptions/ExceptionAlert"
import { toast } from "react-toastify"
import { AxiosError } from "axios"
import { EmailIcon, LockIcon } from "../components/icons/IconsRoutes"
import { useAuthStore } from "../store/auth.store"

export default function LoginPage() {
  const classInputForm = `peer 
    w-full pl-11 pr-4 py-3
    bg-blue-950/90 focus:bg-[var(--color-input)] 
    rounded-xl focus:outline-none transition-all`
  
  const classLabelForm = `
  absolute 
  text-[var(--color-muted-foreground)]
  transition-all duration-300 
  transform 
  pointer-events-none
  
  left-11 top-1/2 scale-100
  
  peer-focus:top-0                 
  peer-focus:left-0                 
  peer-focus:scale-100   
  peer-focus:text-sm               
  peer-focus:font-medium            
  peer-focus:text-[var(--color-foreground)]
  
  peer-[:not(:placeholder-shown)]:top-0
  peer-[:not(:placeholder-shown)]:left-0
  peer-[:not(:placeholder-shown)]:scale-100
  peer-[:not(:placeholder-shown)]:text-sm
  peer-[:not(:placeholder-shown)]:font-medium
  peer-[:not(:placeholder-shown)]:text-[var(--color-foreground)]
  `;
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const navigate = useNavigate()
  const { login: loginToStore } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")
    
    // Validación básica
    if (!username.trim() || !password.trim()) {
      ExceptionAlert.warning("Por favor completa todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        username: username,
        password: password
      });

      // CRÍTICO: Actualizar el store de Zustand
      loginToStore(response.token, response.perfilCompleto);
      toast.success('¡Bienvenido de nuevo!');
      
      // La redirección inicial ya la manejará el componente, 
      // pero si el perfil está incompleto, PrivateRoute lo interceptará.
      navigate("/dashboard");
      

    } catch (error) {
      let errorMessage = "Error al iniciar sesión. Por favor intenta nuevamente.";
      
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        const responseMessage = error.response.data?.message || error.response.data;
        
        // Mensajes específicos según el código de estado
        switch (status) {
          case 401:
            errorMessage = "Usuario o contraseña incorrectos.";
            break;
          case 403:
            errorMessage = responseMessage || "Tu cuenta está bloqueada. Contacta a soporte.";
            break;
          case 423:
            errorMessage = responseMessage || "Tu cuenta está pendiente de activación.";
            break;
          default:
            errorMessage = responseMessage || errorMessage;
        }
      }
      
      console.error("Error en el inicio de sesión:", error);
      ExceptionAlert.error(errorMessage);
      setApiError(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen contents">
      <Navbar />

      <div className="pt-25 pb-25 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
              relative                
              rounded-2xl shadow-xl    
              flex overflow-hidden 
              lg:bg-cover lg:bg-center lg:bg-no-repeat
            "
            style={{ 
              backgroundImage: `url(${fondoLogin})`        
            }}
          >
            {/* --- Columna Izquierda (Formulario) --- */}
            <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-blue-950/70 backdrop-blur-sm relative z-10"> 
              <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">Iniciar Sesión</h1>
                <p className="text-lg text-muted-foreground">Bienvenido de nuevo a BankApp</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- CAMPO DE USUARIO --- */}
                <div className="relative pt-7 mb-3">
                  
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7">
                    <EmailIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </div>
                  
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={classInputForm}
                    placeholder=" "
                    required
                  />

                  {/* Label Flotante */}
                  <label
                    htmlFor="username"
                    className={classLabelForm}
                  >
                    Nombre de Usuario
                  </label>
                </div>

                {/* --- CAMPO DE CONTRASEÑA --- */}
                <div className="relative pt-7 mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7">
                    <LockIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${classInputForm} pr-12`}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password" className={classLabelForm}>Contraseña</label>
                  
                  {/* BOTÓN DE MOSTRAR/OCULTAR */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 h-full flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors z-20"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded  bg-secondary" />
                    <span className="text-muted-foreground">Recordarme</span>
                  </label>
                  <a href="#" className="text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* BOTÓN DE SUBMIT CON LOADER */}
                <button
                  type="submit"
                  className={`w-full cursor-pointer bg-[var(--color-primary)] text-[var(--color-primary-foreground)] py-3.5 rounded-xl font-bold text-lg transition-all shadow-xl flex items-center justify-center
                    ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[var(--color-primary)]/90 hover:scale-[1.02]"}
                  `}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>

                {/* Mensaje de Error de la API */}
                {apiError && (
                  <div className="text-red-400 text-sm font-medium text-center -mt-2">
                    {apiError}
                  </div>
                )}
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/register" className="text-primary font-semibold hover:underline">
                    Regístrate
                  </Link>
                </p>
              </div>
            </div>

            {/* --- Columna Derecha (Imagen de fondo con overlay) --- */}
            <div className="hidden lg:block lg:w-1/2 relative">
              <div className="
                  absolute inset-0 w-full h-full 
                  bg-gradient-to-bl 
                  from-blue-950/70 
                  to-transparent
                "></div>
              <div className="
                  absolute inset-0 w-full h-full 
                  bg-gradient-to-tr 
                  from-black
                  to-transparent
                "></div>
            </div>
            
          </motion.div>
        </div>
      </div>
    </div>
  )
}