"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface DetailedFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  benefits: string[]
  index: number
}

export default function DetailedFeatureCard({
  icon: Icon,
  title,
  description,
  benefits,
  index,
}: DetailedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border  rounded-2xl p-8 hover:border-primary/50 transition-all duration-300"
    >
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
          <ul className="space-y-3">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
