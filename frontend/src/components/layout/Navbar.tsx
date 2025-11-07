import { NavLink, Link } from "react-router-dom"
import { motion } from "framer-motion"
import Logo from "../atoms/Logo"
import Button from "../atoms/Button"

export default function Navbar() {
  const baseLinkClasses = "transition-colors font-medium"
  const activeLinkClasses = "text-primary underline underline-offset-4"
  const inactiveLinkClasses = "text-foreground hover:text-primary hover:underline hover:underline-offset-4"


  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/20 "
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
            >
              Características
            </NavLink>
            
            <NavLink
              to="/security"
              className={({ isActive }) =>
                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
            >
              Seguridad
            </NavLink>
            
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
            >
              Acerca de
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2">
              Iniciar Sesión
            </Link>
            <Button to="/register" variant="secondary" size="sm">
              Comenzar
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}