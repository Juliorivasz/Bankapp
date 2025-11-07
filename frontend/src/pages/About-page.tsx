"use client"

import { motion } from "framer-motion"
import { Target, Heart, Users, Lightbulb, Award, TrendingUp } from "lucide-react"
import SectionHeading from "../components/atoms/SectionHeading"
import ValueCard from "../components/atoms/ValueCard"
import TeamMember from "../components/atoms/TeamMember"
import StatCard from "../components/atoms/StatCard"
import Button from "../components/atoms/Button"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Centrados en el Cliente",
      description: "Cada decisión que tomamos está enfocada en mejorar la experiencia financiera de nuestros usuarios.",
    },
    {
      icon: Lightbulb,
      title: "Innovación Constante",
      description: "Adoptamos las últimas tecnologías para ofrecer soluciones bancarias de vanguardia.",
    },
    {
      icon: Users,
      title: "Transparencia Total",
      description: "Sin comisiones ocultas ni letra pequeña. Todo claro y directo desde el principio.",
    },
    {
      icon: Award,
      title: "Excelencia en Servicio",
      description: "Nuestro equipo está disponible 24/7 para ayudarte con cualquier necesidad.",
    },
  ]

  const team = [
    {
      name: "María González",
      role: "CEO & Fundadora",
      image: "/professional-woman-ceo.png",
    },
    {
      name: "Carlos Rodríguez",
      role: "CTO",
      image: "/professional-man-technology.png",
    },
    {
      name: "Ana Martínez",
      role: "CFO",
      image: "/professional-woman-finance.png",
    },
    {
      name: "Luis Hernández",
      role: "Director de Producto",
      image: "/professional-man-product.jpg",
    },
  ]

  const stats = [
    { value: "500K+", label: "Usuarios Activos" },
    { value: "$2B+", label: "Transacciones Procesadas" },
    { value: "150+", label: "Países Soportados" },
    { value: "99.9%", label: "Uptime Garantizado" },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <SectionHeading title="Sobre BankApp" subtitle="Revolucionando la banca digital para todos" />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-6 leading-relaxed">
            Fundada en 2020, BankApp nació con la misión de democratizar el acceso a servicios financieros de calidad.
            Creemos que todos merecen una banca moderna, transparente y sin complicaciones.
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} index={index} />
          ))}
        </div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border  rounded-3xl p-12 mb-20"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Target className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-foreground mb-4">Nuestra Misión</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Empoderar a las personas con herramientas financieras inteligentes y accesibles que les permitan tomar
                el control de su futuro económico. Queremos eliminar las barreras tradicionales de la banca y crear una
                experiencia financiera que sea simple, segura y diseñada para el mundo digital.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nuestros Valores</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían cada decisión y acción en BankApp
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} index={index} />
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nuestro Equipo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Líderes apasionados con experiencia en fintech, tecnología y servicio al cliente
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <TeamMember key={index} {...member} index={index} />
            ))}
          </div>
        </div>

        {/* Growth Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-12 text-center"
        >
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Únete a Nuestra Historia</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sé parte de la revolución financiera digital y ayúdanos a construir el futuro de la banca
          </p>
          <Button to="/register" variant="primary" size="lg">
            Comenzar Ahora
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
