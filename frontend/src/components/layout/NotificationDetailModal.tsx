import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Check, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Notification, NotificationType } from '../../types/client/notification.types';

interface NotificationDetailModalProps {
  notification: Notification | null;
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function NotificationDetailModal({ 
  notification, 
  onClose, 
  onMarkAsRead, 
  onDelete 
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const getIcon = (tipo: NotificationType) => {
    switch (tipo) {
      case 'SUCCESS': return <CheckCircle className="w-12 h-12 text-green-400" />;
      case 'ERROR': return <AlertCircle className="w-12 h-12 text-red-400" />;
      case 'WARNING': return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      default: return <Info className="w-12 h-12 text-blue-400" />;
    }
  };

  const getGradient = (tipo: NotificationType) => {
    switch (tipo) {
      case 'SUCCESS': return 'from-green-500/20 to-green-900/20 border-green-500/30';
      case 'ERROR': return 'from-red-500/20 to-red-900/20 border-red-500/30';
      case 'WARNING': return 'from-yellow-500/20 to-yellow-900/20 border-yellow-500/30';
      default: return 'from-blue-500/20 to-blue-900/20 border-blue-500/30';
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-lg bg-[var(--color-card)] border rounded-2xl shadow-2xl overflow-hidden ${getGradient(notification.tipo)} border`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* Header / Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-white/5 rounded-full mb-4 ring-1 ring-white/10 shadow-lg">
                {getIcon(notification.tipo)}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {notification.titulo}
              </h2>
              <div className="flex items-center gap-2 text-sm text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <Calendar className="w-4 h-4" />
                {new Date(notification.fechaCreacion).toLocaleString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* Content */}
            <div className="bg-black/20 rounded-xl p-6 mb-8 border border-white/5">
              <p className="text-lg text-white/90 leading-relaxed text-center">
                {notification.mensaje}
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              {!notification.leida && (
                <button
                  onClick={() => {
                    onMarkAsRead(notification.idNotificacion);
                    onClose();
                  }}
                  className="col-span-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--color-primary)]/20"
                >
                  <Check className="w-5 h-5" />
                  Marcar Leída
                </button>
              )}
              
              <button
                onClick={() => {
                  onDelete(notification.idNotificacion);
                  onClose();
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  notification.leida 
                    ? 'col-span-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' 
                    : 'col-span-1 bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/20'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                Eliminar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
