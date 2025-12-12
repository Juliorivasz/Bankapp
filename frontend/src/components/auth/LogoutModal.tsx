import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LogOut className="text-red-400 w-6 h-6" />
                Cerrar Sesión
              </h2>
              <button 
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <LogOut className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">¿Te vas tan pronto?</h3>
              <p className="text-white/60">
                Estás a punto de cerrar tu sesión de forma segura. <br/>
                Tendrás que ingresar tus credenciales nuevamente para acceder.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:scale-[1.02]"
              >
                Sí, Cerrar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
