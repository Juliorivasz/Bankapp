import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  timeLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ 
  isOpen, 
  timeLeft, 
  onExtend, 
  onLogout 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="bg-[#1f2937] border border-red-500/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Tu sesión está por expirar
            </h2>
            
            <p className="text-gray-400 mb-6">
              Por seguridad, tu sesión se cerrará automáticamente en:
            </p>

            <div className="text-4xl font-mono font-bold text-red-400 mb-8">
              00:{timeLeft.toString().padStart(2, '0')}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onLogout}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors border border-white/10"
              >
                Cerrar sesión
              </button>
              <button
                onClick={onExtend}
                className="flex-1 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-[var(--color-primary)]/20"
              >
                Extender sesión
              </button>
            </div>
          </div>
          
          <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/10 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-300 font-medium">No pierdas tu progreso</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
