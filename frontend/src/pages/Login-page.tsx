"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import Navbar from "../components/layout/Navbar"
import fondoLogin from "/fondo_wallet.webp" // Asegúrate de que esta ruta sea correcta

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", { email, password })
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 pb-20 px-6 lg:px-8">
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
                {/* --- CAMPO DE CORREO ELECTRÓNICO --- */}
                <div className="relative pt-7 mb-3"> {/* 1. AÑADIMOS PADDING SUPERIOR AL CONTENEDOR */}
                  
                  {/* Icono (sin cambios) */}
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7"> {/* 2. Ajustamos 'top' */}
                    <EmailIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>

                  {/* Input (con 'peer') */}
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      peer 
                      w-full pl-11 pr-4 py-3
                      bg-blue-950/90 focus:bg-[var(--color-input)] 
                      rounded-xl focus:outline-none transition-all
                    "
                    placeholder=" " /* <-- Placeholder de espacio (¡obligatorio!) */
                    required
                  />

                  {/* Label Flotante */}
                  <label
                    htmlFor="email"
                    className="
                      absolute 
                      text-[var(--color-muted-foreground)]
                      transition-all duration-300 
                      transform 
                      pointer-events-none

                      /* 3. Posición por defecto (en el medio, como placeholder) */
                      left-11 top-1/2 scale-100

                      /* 4. Posición 'flotando' (¡FUERA y ARRIBA!) */
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
                    "
                  >
                    Correo Electrónico
                  </label>
                </div>

                {/* --- CAMPO DE CONTRASEÑA --- */}
                <div className="relative pt-7 mb-[3rem]"> {/* 1. AÑADIMOS PADDING SUPERIOR AL CONTENEDOR */}

                  {/* Icono (ajustado con 'top-7') */}
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7">
                    <LockIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>

                  {/* Input (con 'peer') */}
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      peer 
                      w-full pl-11 pr-4 py-3 
                      bg-blue-950/90 focus:bg-[var(--color-input)] 
                      rounded-xl focus:outline-none transition-all
                    "
                    placeholder=" " /* <-- Placeholder de espacio */
                    required
                  />

                  {/* Label Flotante */}
                  <label
                    htmlFor="password"
                    className="
                      absolute 
                      text-[var(--color-muted-foreground)]
                      transition-all duration-300 
                      transform 
                      pointer-events-none

                      /* Posición por defecto */
                      left-11 top-1/2 scale-100

                      /* Posición 'flotando' (FUERA y ARRIBA) */
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
                    "
                  >
                    Contraseña
                  </label>
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

                <button
                  type="submit"
                  className="w-full bg-[var(--color-button)] text-primary-foreground py-3.5 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-xl"
                >
                  Iniciar Sesión
                </button>
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

            {/* --- Columna Derecha (La otra mitad de la imagen de fondo) --- */}
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

// --- Componentes de Iconos (sin cambios) ---
function EmailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}