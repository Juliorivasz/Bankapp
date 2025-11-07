"use client"

import type React from "react"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import Navbar from "../components/layout/Navbar"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register:", { name, email, password, confirmPassword })
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Crear Cuenta</h1>
              <p className="text-lg text-muted-foreground">Únete a millones de usuarios en BankApp</p>
            </div>

            <div className="bg-card border  rounded-2xl p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nombre Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border  rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border  rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border  rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" className="w-4 h-4 mt-1 rounded " required />
                  <label className="text-sm text-muted-foreground">
                    Acepto los{" "}
                    <a href="#" className="text-primary hover:underline">
                      términos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="#" className="text-primary hover:underline">
                      política de privacidad
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold text-lg hover:bg-foreground/90 transition-all hover:scale-[1.02] shadow-xl"
                >
                  Crear Cuenta
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  ¿Ya tienes una cuenta?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Inicia Sesión
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
