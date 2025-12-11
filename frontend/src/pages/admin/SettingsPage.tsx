import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-full bg-[var(--color-background)] text-white p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[var(--color-primary)]/20 rounded-xl">
            <Settings className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Configuración
          </h1>
        </div>
        <p className="text-base sm:text-lg text-white/70">
          Personaliza tu experiencia y ajusta las preferencias de la aplicación.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center"
      >
        <p className="text-white/60 text-lg">
          Página en construcción
        </p>
        <p className="text-white/40 text-sm mt-2">
          Pronto podrás configurar todas las opciones de la aplicación
        </p>
      </motion.div>
    </div>
  );
}
