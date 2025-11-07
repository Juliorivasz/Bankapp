"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, Fingerprint, AlertTriangle, CheckCircle, FileCheck, Server } from "lucide-react"
import SectionHeading from "../components/atoms/SectionHeading"
import SecurityFeature from "../components/atoms/SecurityFeature"
import Button from "../components/atoms/Button"

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Encriptación de Extremo a Extremo",
      description:
        "Todos tus datos están protegidos con encriptación AES-256, el mismo estándar usado por instituciones gubernamentales.",
    },
    {
      icon: Fingerprint,
      title: "Autenticación Biométrica",
      description:
        "Accede a tu cuenta de forma segura usando huella digital o reconocimiento facial en dispositivos compatibles.",
    },
    {
      icon: Eye,
      title: "Monitoreo 24/7",
      description:
        "Nuestro sistema de inteligencia artificial monitorea todas las transacciones en busca de actividad sospechosa.",
    },
    {
      icon: AlertTriangle,
      title: "Alertas Instantáneas",
      description:
        "Recibe notificaciones inmediatas de cualquier actividad en tu cuenta para detectar fraudes rápidamente.",
    },
    {
      icon: CheckCircle,
      title: "Verificación en Dos Pasos",
      description:
        "Capa adicional de seguridad que requiere confirmación en tu dispositivo móvil para operaciones sensibles.",
    },
    {
      icon: Server,
      title: "Infraestructura Segura",
      description: "Servidores redundantes en múltiples ubicaciones con respaldo automático de toda tu información.",
    },
  ]

  const compliance = [
    {
      title: "PCI DSS Nivel 1",
      description: "Cumplimos con los más altos estándares de seguridad para el procesamiento de pagos.",
    },
    {
      title: "ISO 27001",
      description: "Certificación internacional en gestión de seguridad de la información.",
    },
    {
      title: "GDPR Compliant",
      description: "Protección total de datos personales según normativas europeas.",
    },
    {
      title: "SOC 2 Type II",
      description: "Auditorías independientes que verifican nuestros controles de seguridad.",
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <SectionHeading
            title="Tu Seguridad es Nuestra Prioridad"
            subtitle="Protección de nivel bancario para tu tranquilidad"
          />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-6 leading-relaxed">
            Implementamos las tecnologías de seguridad más avanzadas y cumplimos con los estándares internacionales más
            estrictos para proteger tu dinero e información.
          </p>
        </motion.div>

        {/* Security Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Capas de Protección</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <SecurityFeature key={index} {...feature} index={index} />
            ))}
          </div>
        </div>

        {/* Compliance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border  rounded-3xl p-12 mb-20"
        >
          <div className="text-center mb-12">
            <FileCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Certificaciones y Cumplimiento</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mantenemos las certificaciones más rigurosas de la industria financiera
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {compliance.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Tu dinero está protegido</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a más de 500,000 usuarios que confían en nuestra seguridad
          </p>
          <Button to="/register" variant="primary" size="lg">
            Abrir Cuenta Segura
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
