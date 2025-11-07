"use client"

import { motion } from "framer-motion"
import Button from "../atoms/Button"

export default function CTA() {
  return (
    <section className="py-32 px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-balance text-foreground">
            ¿Listo para transformar tus finanzas?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 text-pretty">
            Únete a millones que confían en BankApp para sus necesidades de banca digital. Comienza en minutos.
          </p>
          <Button to="/register" variant="primary" size="lg" className="border border-black/20 bg-blue-800/10 backdrop-blur-3xl hover:bg-blue-700/10 transition-all duration-300">
            Crea Tu Cuenta
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
