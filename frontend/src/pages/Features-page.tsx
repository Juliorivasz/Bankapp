"use client"

import { motion } from "framer-motion"
import { CreditCard, Smartphone, TrendingUp, Shield, Zap, Globe, PiggyBank, BarChart3 } from "lucide-react"
import SectionHeading from "../components/atoms/SectionHeading"
import DetailedFeatureCard from "../components/atoms/DetailedFeatureCard"
import Button from "../components/atoms/Button"

export default function FeaturesPage() {
  const features = [
    {
      icon: CreditCard,
      title: "Tarjetas Virtuales y Físicas",
      description: "Gestiona tus finanzas con tarjetas de débito y crédito diseñadas para tu estilo de vida digital.",
      benefits: [
        "Tarjetas virtuales instantáneas para compras online",
        "Tarjetas físicas con diseño personalizado",
        "Control total de límites y gastos",
        "Cashback en todas tus compras",
      ],
    },
    {
      icon: Smartphone,
      title: "Banca Móvil Avanzada",
      description: "Toda la potencia de tu banco en la palma de tu mano con nuestra app móvil de última generación.",
      benefits: [
        "Interfaz intuitiva y fácil de usar",
        "Transferencias instantáneas 24/7",
        "Notificaciones en tiempo real",
        "Biometría para máxima seguridad",
      ],
    },
    {
      icon: TrendingUp,
      title: "Inversiones Inteligentes",
      description:
        "Haz crecer tu dinero con nuestras herramientas de inversión automatizadas y asesoría personalizada.",
      benefits: [
        "Portafolios diversificados automáticamente",
        "Inversión desde $100 pesos",
        "Análisis de mercado en tiempo real",
        "Asesoría financiera sin costo adicional",
      ],
    },
    {
      icon: PiggyBank,
      title: "Ahorro Automático",
      description: "Alcanza tus metas financieras con nuestro sistema de ahorro inteligente que trabaja por ti.",
      benefits: [
        "Redondeo automático de compras",
        "Metas de ahorro personalizables",
        "Intereses competitivos",
        "Sin comisiones por manejo de cuenta",
      ],
    },
    {
      icon: BarChart3,
      title: "Análisis Financiero",
      description: "Comprende tus hábitos de gasto con reportes detallados y recomendaciones personalizadas.",
      benefits: [
        "Categorización automática de gastos",
        "Reportes mensuales detallados",
        "Predicción de gastos futuros",
        "Alertas de gastos inusuales",
      ],
    },
    {
      icon: Globe,
      title: "Pagos Internacionales",
      description: "Envía y recibe dinero a cualquier parte del mundo con las mejores tasas de cambio.",
      benefits: [
        "Transferencias a más de 150 países",
        "Tipos de cambio competitivos",
        "Sin comisiones ocultas",
        "Llegada en menos de 24 horas",
      ],
    },
    {
      icon: Zap,
      title: "Pagos Instantáneos",
      description: "Realiza pagos y transferencias al instante con nuestra tecnología de última generación.",
      benefits: [
        "Transferencias en menos de 5 segundos",
        "Pago con QR en comercios",
        "Solicitud de dinero a contactos",
        "Historial completo de transacciones",
      ],
    },
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Tu dinero protegido con los más altos estándares de seguridad bancaria internacional.",
      benefits: [
        "Encriptación de nivel bancario",
        "Autenticación de dos factores",
        "Monitoreo 24/7 de fraudes",
        "Seguro contra robo de identidad",
      ],
    },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <SectionHeading
            title="Características Completas"
            subtitle="Todo lo que necesitas para gestionar tu dinero de forma inteligente"
          />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-6 leading-relaxed">
            Descubre todas las herramientas y funcionalidades que hacen de BankApp la mejor opción para tus finanzas
            personales y empresariales.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-8 mb-20">
          {features.map((feature, index) => (
            <DetailedFeatureCard key={index} {...feature} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Listo para experimentar el futuro de la banca?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya disfrutan de todas estas características
          </p>
          <Button to="/register" variant="primary" size="lg">
            Abrir Cuenta Gratis
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
