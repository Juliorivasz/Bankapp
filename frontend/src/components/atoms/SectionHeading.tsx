"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface SectionHeadingProps {
  title: string | ReactNode
  subtitle?: string
  centered?: boolean
}

export default function SectionHeading({ title, subtitle, centered = true }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={centered ? "text-center mb-20" : "mb-12"}
    >
      <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-balance text-foreground">{title}</h2>
      {subtitle && <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{subtitle}</p>}
    </motion.div>
  )
}
