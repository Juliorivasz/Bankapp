import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/auth.store';
import type { Wallet } from '../../types/client/dashboard.types';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ isOpen, onClose, wallet }) => {
  const { user } = useAuthStore();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">{wallet.flag}</span>
              Datos de tu cuenta
            </h3>

            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Alias (Usuario)</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-mono text-white">{user?.sub || 'Usuario'}</span>
                  <button onClick={() => copyToClipboard(user?.sub || '', 'Alias')} className="text-[var(--color-primary)] hover:text-white transition-colors">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">CBU / Número de Cuenta</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-mono text-white break-all">{wallet.accountNumber}</span>
                  <button onClick={() => copyToClipboard(wallet.accountNumber, 'CBU')} className="text-[var(--color-primary)] hover:text-white transition-colors">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Titular</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-white capitalize">{user?.sub}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-center text-white/40">
              Comparte estos datos solo para recibir transferencias.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
