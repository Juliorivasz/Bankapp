"use client"

import { motion } from "framer-motion"

interface TeamMemberProps {
  name: string
  role: string
  image: string
  index: number
}

export default function TeamMember({ name, role, image, index }: TeamMemberProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="text-center"
    >
      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
      <p className="text-primary font-medium">{role}</p>
    </motion.div>
  )
}
