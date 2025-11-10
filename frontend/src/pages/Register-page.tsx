"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"
import Navbar from "../components/layout/Navbar"
import fondoRegister from "/fondo_register.webp"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function ValidationItem({ text, valid }: { text: string; valid: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 text-sm ${
        valid ? "text-green-400" : "text-[var(--color-muted-foreground)]"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          valid ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {text}
    </motion.div>
  )
}

export default function RegisterPage() {
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordChecks, setShowPasswordChecks] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validationChecks = useMemo(() => {
    return [
      { text: "Mínimo 6 caracteres", valid: password.length >= 6 },
      { text: "Una mayúscula (A-Z)", valid: /[A-Z]/.test(password) },
      { text: "Una minúscula (a-z)", valid: /[a-z]/.test(password) },
      { text: "Un número (0-9)", valid: /[0-9]/.test(password) },
      { text: "Un carácter especial (!@#...)", valid: /[^A-Za-z0-9]/.test(password) },
    ]
  }, [password])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register:", { name, email, password, confirmPassword })
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="pt-20 pb-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
              relative
              flex overflow-hidden
              rounded-2xl shadow-xl
              lg:bg-cover lg:bg-center lg:bg-no-repeat
            "
            style={{
              backgroundImage: `url(${fondoRegister})`,
            }}>
            {/* --- Columna Izquierda (Formulario) --- */}
            <div className="w-full lg:w-1/2 p-8 sm:p-10 bg-blue-950/70 backdrop-blur-md relative z-10">
              {/* 4. Formulario con 'space-y-8' para más espacio */}
              <form
                onSubmit={handleSubmit}
                className="space-y-6">
                {/* --- Campo Nombre (Floating Label) --- */}
                <div className="relative pt-7 mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7">
                    <UserIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={classInputForm}
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="name"
                    className={classLabelForm}>
                    Nombre Completo
                  </label>
                </div>

                {/* --- Campo Email (Floating Label) --- */}
                <div className="relative pt-7 mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7">
                    <EmailIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={classInputForm}
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="email"
                    className={classLabelForm}>
                    Correo Electrónico
                  </label>
                </div>

                {/* --- Campo Contraseña (Floating Label) --- */}
                <div className="relative pt-7 mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7">
                    <LockIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowPasswordChecks(true)}
                    className={`${classInputForm} pr-12`}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password" className={classLabelForm}>Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 h-full flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors z-20"
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                {/* --- CONFIRMAR CONTRASEÑA (MODIFICADO) --- */}
                <div className="relative pt-7 mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7">
                    <LockIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setShowPasswordChecks(true)}
                    className={`${classInputForm} pr-12`}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="confirmPassword" className={classLabelForm}>Confirmar Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4 h-full flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors z-20"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-start gap-2 my-6">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 rounded border-[var(--color-border)] bg-[var(--color-input)]"
                    required
                  />
                  <label className="text-sm text-[var(--color-muted-foreground)]">
                    Acepto los{" "}
                    <a
                      href="#"
                      className="text-[var(--color-primary)] hover:underline">
                      términos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a
                      href="#"
                      className="text-[var(--color-primary)] hover:underline">
                      política de privacidad
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] py-3.5 rounded-xl font-bold text-lg hover:bg-[var(--color-primary)]/90 transition-all hover:scale-[1.02] shadow-xl">
                  Crear Cuenta
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-[var(--color-muted-foreground)]">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/login"
                    className="text-[var(--color-primary)] font-semibold hover:underline">
                    Inicia Sesión
                  </Link>
                </p>
              </div>
            </div>

            {/* --- Columna Derecha (Imagen) --- */}
            {/* 5. Revela la 2da mitad del fondo y aplica el 'fade' */}
            <div className="hidden lg:block lg:w-1/2 relative">
              <div className="text-center relative z-10 pt-10 px-8">
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center">
                  <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">Crear Cuenta</h1>
                  <p className="text-xl text-blue-100 drop-shadow-md">Únete a millones de usuarios en BankApp</p>
                </motion.div>
              </div>
              <div className="relative z-10 pt-20 px-12">
                <AnimatePresence mode="wait">
                  {showPasswordChecks && (
                    <motion.div
                      key="checks"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xl">
                      <h3 className="text-lg font-semibold text-white mb-4">Requisitos de Contraseña</h3>
                      <div className="space-y-3">
                        {validationChecks.map((check, index) => (
                          <ValidationItem
                            key={index}
                            text={check.text}
                            valid={check.valid}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div
                className="
                  absolute inset-0 w-full h-full 
                  bg-gradient-to-bl 
                  from-blue-950/70 
                  to-transparent
                "></div>
              <div
                className="
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
  );
}

// --- Componentes de Iconos ---

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A1.75 1.75 0 0118 21.75H6.75a1.75 1.75 0 01-1.249-1.632z" />
    </svg>
  );
}

function EmailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}