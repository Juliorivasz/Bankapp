"use client"

import { motion } from "framer-motion"

interface StatCardProps {
  value: string
  label: string
  index: number
}

export default function StatCard({ value, label, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center"
    >
      <div className="text-5xl font-bold mb-2 text-foreground">{value}</div>
      <div className="text-muted-foreground font-medium">{label}</div>
    </motion.div>
  )
}
