"use client"

import { Link } from "react-router-dom"
import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  to?: string
  onClick?: () => void
  className?: string
}

export default function Button({
  children,
  variant = "secondary",
  size = "md",
  to,
  onClick,
  className = "",
}: ButtonProps) {
  const baseStyles = "font-bold rounded-xl transition-all hover:scale-105 inline-block text-center"

  const variantStyles = {
    primary: "bg-foreground text-background hover:bg-foreground/90 shadow-2xl",
    secondary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl",
    outline: "border-2  hover:bg-secondary text-foreground",
  }

  const sizeStyles = {
    sm: "px-6 py-2 text-sm",
    md: "px-10 py-4 text-lg",
    lg: "px-12 py-5 text-xl",
  }

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={combinedStyles}>
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={combinedStyles}>
      {children}
    </button>
  )
}
