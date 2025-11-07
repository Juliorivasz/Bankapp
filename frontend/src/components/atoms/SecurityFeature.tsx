"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface SecurityFeatureProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
}

export default function SecurityFeature({ icon: Icon, title, description, index }: SecurityFeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border  rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
    >
      <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}
