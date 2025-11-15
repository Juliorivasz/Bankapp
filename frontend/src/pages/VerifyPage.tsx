"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/layout/Navbar" // Asumo que quieres mantener el Navbar
import { Loader2, CheckCircle2, XCircle, RefreshCw, ArrowRight } from "lucide-react"
import { authService } from "../service/auth.service"
import { ExceptionAlert } from "../utils/exceptions/ExceptionAlert"
import { AxiosError } from "axios"

const getEmailFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).sub;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState("Validando tu token de seguridad...")
  const [emailToResend, setEmailToResend] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  // Usamos useRef para evitar doble ejecución en React StrictMode
  const verificationAttempted = useRef(false)

  useEffect(() => {
    const token = searchParams.get("token")

    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    if (!token) {
      setStatus('error')
      setMessage("No se encontró un token de verificación. El enlace podría estar roto.")
      return
    }

    // Intentamos extraer el email por si falla y necesitamos reenviar
    const email = getEmailFromToken(token)
    if (email) setEmailToResend(email)

    // Llamada al servicio
    const verify = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const data = await authService.verificarCuenta(token)
        
        setStatus('success')
        setMessage(typeof data === 'string' ? data : "¡Tu cuenta ha sido verificada exitosamente!")
        
      } catch (error) {
        setStatus('error')
        let errorMsg = "El enlace de verificación es inválido o ha expirado."
        
        if (error instanceof AxiosError && error.response?.data) {
           const backendData = error.response.data
           errorMsg = backendData.message || (typeof backendData === 'string' ? backendData : errorMsg)
        }
        
        setMessage(errorMsg)
      }
    }

    verify()
  }, [searchParams])

  // Handler para reenviar el correo
  const handleResendEmail = async () => {
    if (!emailToResend) {
      ExceptionAlert.error("No pudimos encontrar tu email para reenviar el código.")
      return
    }

    setIsResending(true)
    try {
      await authService.reenviarEmailVerificacion(emailToResend)
      ExceptionAlert.success("¡Correo reenviado!, Revisa tu bandeja de entrada nuevamente.")
    } catch (error) {
      ExceptionAlert.error("Error al reenviar, Intenta registrarte nuevamente o contacta soporte.")
      console.error("Error reenviando email de verificación:", error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="pt-32 pb-20 px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--color-card)]/60 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-2xl p-10 text-center"
          >
            
            {/* --- ESTADO: VERIFICANDO --- */}
            {status === 'verifying' && (
              <div className="flex flex-col items-center py-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[var(--color-primary)] blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="w-20 h-20 text-[var(--color-primary)] animate-spin relative z-10" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Verificando Cuenta</h1>
                <p className="text-lg text-[var(--color-muted-foreground)] animate-pulse">
                  {message}
                </p>
              </div>
            )}

            {/* --- ESTADO: ÉXITO --- */}
            {status === 'success' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-4"
              >
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">¡Todo Listo!</h1>
                <p className="text-[var(--color-muted-foreground)] mb-8 text-lg">
                  {message}
                </p>
                
                <Link 
                  to="/login" 
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] py-3.5 rounded-xl font-bold text-lg hover:bg-[var(--color-primary)]/90 transition-all shadow-lg hover:shadow-[var(--color-primary)]/20 transform hover:-translate-y-1"
                >
                  Iniciar Sesión <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            )}

            {/* --- ESTADO: ERROR --- */}
            {status === 'error' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-4"
              >
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <XCircle className="w-12 h-12 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Verificación Fallida</h1>
                <p className="text-[var(--color-muted-foreground)] mb-8 text-lg leading-relaxed">
                  {message}
                </p>

                <div className="flex flex-col gap-3 w-full">
                  {/* Botón para Reenviar (Solo si tenemos el email) */}
                  {emailToResend && message !== "La cuenta ya está activa." && (
                    <button 
                      onClick={handleResendEmail}
                      disabled={isResending}
                      className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                      {isResending ? "Reenviando..." : "Reenviar Correo de Verificación"}
                    </button>
                  )}

                  <Link 
                    to="/login" 
                    className="w-full text-[var(--color-primary)] py-3 font-medium hover:underline mt-2"
                  >
                    Volver al Inicio de Sesión
                  </Link>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      </div>
      
      {/* Fondo decorativo sutil */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-secondary)]/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}