"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState, useEffect } from "react"
import Navbar from "../components/layout/Navbar"
import fondoRegister from "/fondo_register.webp"
import { EyeIcon } from "lucide-react"
import type { ICountry } from "../types/auth/Country"

// ... (ValidationItem se mantiene igual) ...
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
      <div className={`w-2 h-2 rounded-full ${valid ? "bg-green-500" : "bg-red-500"}`} />
      {text}
    </motion.div>
  )
}

export default function RegisterPage() {
  
  // --- TUS VARIABLES DE ESTILO (SIN CAMBIOS) ---
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

  // --- 1. ESTADOS ---
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  // Estado simplificado para el DTO de /registro/rapido
  const [formData, setFormData] = useState({
    pais: "",
    nombreUsuario: "",
    email: "",
    password: "",
    confirmPassword: "", // Solo para validación del front
  })

  // Estados de UI
  const [countries, setCountries] = useState<ICountry[]>([])
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [showPasswordChecks, setShowPasswordChecks] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estado para mensaje de éxito/error
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiError, setApiError] = useState("")

  // --- 2. LÓGICA ---

  // Cargar países
  useEffect(() => {
    fetch("http://localhost:8080/api/paises/")
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error("Error cargando países:", err))
  }, [])

  // Handler de cambio genérico
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handler para el selector de país
  const handleCountrySelect = (country: ICountry) => {
    setFormData(prev => ({ ...prev, pais: country.nombrePais }));
    setIsCountryDropdownOpen(false);
  }

  // Validación de contraseña
  const validationChecks = useMemo(() => {
    const { password } = formData
    return [
      { text: "Mínimo 6 caracteres", valid: password.length >= 6 },
      { text: "Una mayúscula (A-Z)", valid: /[A-Z]/.test(password) },
      { text: "Una minúscula (a-z)", valid: /[a-z]/.test(password) },
      { text: "Un número (0-9)", valid: /[0-9]/.test(password) },
      { text: "Un carácter especial (!@#...)", valid: /[^A-Za-z0-9]/.test(password) },
    ]
  }, [formData])

  // Envío y navegación de pasos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("") // Limpia errores previos

    if (currentStep === 1) {
      if (!formData.pais) {
        alert("Por favor, selecciona tu país.");
        return;
      }
      setCurrentStep(2) // Avanza al siguiente paso
    } else {
      // Es el último paso, enviar al backend
      if (formData.password !== formData.confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }
      
      // Construimos el DTO final
      const dtoToSend = {
        nombreUsuario: formData.nombreUsuario,
        email: formData.email,
        password: formData.password,
        pais: formData.pais
      }

      console.log("Enviando a /api/auth/registro/rapido:", dtoToSend)

      try {
        const response = await fetch("http://localhost:8080/api/auth/registro/rapido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoToSend)
        })

        if (!response.ok) {
          const errorData = await response.text() // O .json() si tu backend devuelve un objeto de error
          throw new Error(errorData || "Error en el registro. Intenta de nuevo.");
        }

        // Éxito
        setIsSubmitted(true) // Mostramos la pantalla de "revisa tu correo"

      } catch (error) {
        console.error("Error en handleSubmit:", error)
        setApiError(error instanceof Error ? error.message : "Error en el registro. Intenta de nuevo.")
      }
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => (prev > 1 ? prev - 1 : 1))
  }

  const selectedCountry = useMemo(() =>
    countries.find(c => c.nombrePais === formData.pais)
  , [formData.pais, countries])

  const stepTitles = ["Tu País", "Tus Datos"]

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="pt-20 pb-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative flex overflow-hidden rounded-2xl shadow-xl lg:bg-cover lg:bg-center lg:bg-no-repeat"
            style={{ backgroundImage: `url(${fondoRegister})` }}
          >
            {/* --- Columna Izquierda (Formulario) --- */}
            <div className="w-full lg:w-1/2 p-8 sm:p-10 bg-blue-950/70 backdrop-blur-md relative z-10 flex flex-col min-h-[650px]">
              
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  // --- VISTA DE ÉXITO ---
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center h-full"
                  >
                    <EmailIcon className="w-16 h-16 text-green-400 mb-6" />
                    <h1 className="text-3xl font-bold mb-4">¡Revisa tu correo!</h1>
                    <p className="text-lg text-[var(--color-muted-foreground)]">
                      Hemos enviado un enlace de verificación a <span className="font-bold text-white">{formData.email}</span>.
                    </p>
                    <p className="text-md text-[var(--color-muted-foreground)] mt-4">
                      Haz clic en el enlace para activar tu cuenta.
                    </p>
                    <Link to="/login" className="mt-8 w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] py-3.5 rounded-xl font-bold text-lg hover:bg-[var(--color-primary)]/90 transition-all shadow-xl text-center">
                      Volver a Inicio
                    </Link>
                  </motion.div>
                ) : (
                  // --- VISTA DEL FORMULARIO WIZARD ---
                  <motion.div
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    {/* Encabezado del Wizard */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-[var(--color-primary)]">
                        PASO {currentStep} DE {totalSteps}
                      </p>
                      <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">{stepTitles[currentStep - 1]}</h1>
                      <div className="w-full h-1.5 bg-[var(--color-input)] rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[var(--color-primary)]"
                          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    
                    {/* Formulario principal */}
                    <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                      <div className="flex-grow">
                        <AnimatePresence mode="wait">
                          
                          {/* --- PASO 1: PAÍS --- */}
                          {currentStep === 1 && (
                            <motion.div
                              key="step1"
                              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                              className="space-y-6"
                            >
                              <div className="relative pt-7 mb-2">
                                <label className="absolute top-0 left-0 text-sm font-medium text-[var(--color-foreground)]">País de Residencia</label>
                                <div className="relative">
                                  {/* Este botón imita tu 'classInputForm' */}
                                  <button
                                    type="button"
                                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                    className="peer w-full pl-11 pr-12 py-3 bg-blue-950/90 focus:bg-[var(--color-input)] rounded-xl focus:outline-none transition-all text-left flex items-center"
                                  >
                                    <span className={formData.pais ? "text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)]"}>
                                      {formData.pais || "Selecciona un país"}
                                    </span>
                                  </button>
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                    {selectedCountry ? (
                                      <img src={`https://flagcdn.com/w20/${selectedCountry.codigoIso.toLowerCase()}.png`} alt={selectedCountry.nombrePais} />
                                    ) : (
                                      <GlobeIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                                    )}
                                  </div>
                                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
                                    <ChevronDownIcon className={`w-5 h-5 text-[var(--color-muted-foreground)] transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>
                                
                                <AnimatePresence>
                                  {isCountryDropdownOpen && (
                                    <motion.ul
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="absolute w-full mt-1 bg-[var(--color-input)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                                    >
                                      {countries.length > 0 ? (
                                        countries.map((country: ICountry) => (
                                          <li
                                            key={country.idPais}
                                            onClick={() => handleCountrySelect(country)}
                                            className="flex items-center gap-3 px-4 py-3 text-[var(--color-foreground)] hover:bg-blue-950/90 cursor-pointer"
                                          >
                                            <img src={`https://flagcdn.com/w20/${country.codigoIso.toLowerCase()}.png`} alt={country.nombrePais} />
                                            {country.nombrePais}
                                          </li>
                                        ))
                                      ) : (
                                        <li className="px-4 py-3 text-[var(--color-muted-foreground)]">Cargando...</li>
                                      )}
                                    </motion.ul>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}

                          {/* --- PASO 2: DATOS DE CUENTA --- */}
                          {currentStep === 2 && (
                            <motion.div
                              key="step2"
                              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                              className="space-y-6"
                            >
                              <div className="relative pt-7 mb-2">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7"><UserIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" /></div>
                                <input id="nombreUsuario" name="nombreUsuario" type="text" value={formData.nombreUsuario} onChange={handleChange} className={classInputForm} placeholder=" " required />
                                <label htmlFor="nombreUsuario" className={classLabelForm}>Nombre de Usuario</label>
                              </div>
                              
                              <div className="relative pt-7 mb-2">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7"><EmailIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" /></div>
                                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={classInputForm} placeholder=" " required />
                                <label htmlFor="email" className={classLabelForm}>Correo Electrónico</label>
                              </div>

                              <div className="relative pt-7 mb-2">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7"><LockIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" /></div>
                                <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} onFocus={() => setShowPasswordChecks(true)} className={`${classInputForm} pr-12`} placeholder=" " required />
                                <label htmlFor="password" className={classLabelForm}>Contraseña</label>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-7 h-full flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] z-20" style={{ maxHeight: '48px' }}><EyeIcon className="w-5 h-5" /></button>
                              </div>

                              <div className="relative pt-7 mb-2">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 top-7"><LockIcon className="w-5 h-5 text-[var(--color-muted-foreground)]" /></div>
                                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} onFocus={() => setShowPasswordChecks(true)} className={`${classInputForm} pr-12`} placeholder=" " required />
                                <label htmlFor="confirmPassword" className={classLabelForm}>Confirmar Contraseña</label>
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-7 h-full flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] z-20" style={{ maxHeight: '48px' }}><EyeIcon className="w-5 h-5" /></button>
                              </div>

                              <div className="flex items-start gap-2 pt-4">
                                <input type="checkbox" id="terms" className="w-4 h-4 mt-1 rounded border-[var(--color-border)] bg-[var(--color-input)]" required />
                                <label htmlFor="terms" className="text-sm text-[var(--color-muted-foreground)]">
                                  Acepto los <a href="#" className="text-[var(--color-primary)] hover:underline">términos</a> y <a href="#" className="text-[var(--color-primary)] hover:underline">política de privacidad</a>.
                                </label>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Botones de Navegación */}
                      <div className="flex gap-4 pt-8 mt-auto">
                        {currentStep > 1 && (
                          <button type="button" onClick={prevStep} className="w-full bg-transparent border border-[var(--color-border)] text-[var(--color-foreground)] py-3.5 rounded-xl font-bold text-lg hover:bg-[var(--color-input)] transition-all">
                            Anterior
                          </button>
                        )}
                        <button
                          type="submit"
                          className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] py-3.5 rounded-xl font-bold text-lg hover:bg-[var(--color-primary)]/90 transition-all shadow-xl"
                        >
                          {currentStep === totalSteps ? "Crear Cuenta" : "Siguiente"}
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-[var(--color-muted-foreground)]">
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
                          Inicia Sesión
                        </Link>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- Columna Derecha (Contextual) --- */}
            <div className="hidden lg:block lg:w-1/2 relative">
              <div className="relative z-10 pt-20 px-12 min-h-[480px]">
                <AnimatePresence mode="wait">
                  {/* Mostrar validaciones solo en PASO 2 */}
                  {(currentStep === 2 && showPasswordChecks && !isSubmitted) ? (
                    <motion.div
                      key="checks"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xl"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4">Requisitos de Contraseña</h3>
                      <div className="space-y-3">
                        {validationChecks.map((check, index) => (
                          <ValidationItem key={index} text={check.text} valid={check.valid} />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    // Mensaje de bienvenida contextual
                    <motion.div
                      key={`intro-${currentStep}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="text-center pt-10"
                    >
                      <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
                        {currentStep === 1 ? "Bienvenido" : "Casi Listo"}
                      </h1>
                      <p className="text-xl text-blue-100 drop-shadow-md">
                        {currentStep === 1 ? "Selecciona tu país para configurar tu cuenta." : "Solo necesitamos tus datos de acceso."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Overlays de fondo */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-bl from-blue-950/70 to-transparent"></div>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-black to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
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
function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.24 0 .468.02.69.055M12 21c-.24 0-.468.02-.69.055M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M12 3c.24 0 .468-.02.69-.055M12 3c-.24 0-.468-.02-.69-.055M3.29 8.7a9.006 9.006 0 0017.42 0M3.29 8.7c.03.181.066.357.106.528M3.29 8.7c-.03-.181-.066-.357-.106-.528M20.71 8.7a9.006 9.006 0 01-17.42 0M20.71 8.7c-.03.181-.066.357-.106.528M20.71 8.7c.03-.181.066.357.106-.528M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  );
}
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}