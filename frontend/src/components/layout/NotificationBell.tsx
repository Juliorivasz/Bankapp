import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { notificationService } from '../../service/notification.service';
import type { Notification, NotificationType } from '../../types/client/notification.types';
import { toast } from 'react-toastify';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, right: 0 });

  // Update position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        setPopupPosition({
          top: rect.bottom + 12, // 12px de margen
          right: window.innerWidth - rect.right
        });
      };
      
      updatePosition();
      // Recalcular al hacer resize/scroll es opcional pero recomendado
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen]);

  // Load notifications
  const loadNotifications = async () => {
    try {
      const [allNotifications, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      await loadNotifications();
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  };

  const getNotificationColor = (tipo: NotificationType) => {
    switch (tipo) {
      case 'SUCCESS':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'ERROR':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'WARNING':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    }
  };




  const getNotificationIcon = (tipo: NotificationType) => {
    switch (tipo) {
      case 'SUCCESS':
        return '✓';
      case 'ERROR':
        return '✕';
      case 'WARNING':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel - Rendered in Portal to escape parent stacking contexts */}
      {isOpen && createPortal(
        <>
          {/* Backdrop invisible para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div 
            style={{ 
              top: `${popupPosition.top}px`, 
              right: `${popupPosition.right}px` 
            }}
            className="fixed w-96 max-w-[calc(100vw-2rem)] max-h-[80vh] bg-[var(--color-card)] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 disabled:opacity-50"
                  >
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/40">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => (
                    <div
                      key={notification.idNotificacion}
                      className={`p-4 hover:bg-white/5 transition-colors ${
                        !notification.leida ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotificationColor(
                            notification.tipo
                          )}`}
                        >
                          <span className="text-sm font-bold">
                            {getNotificationIcon(notification.tipo)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-white text-sm">
                              {notification.titulo}
                            </h4>
                            {!notification.leida && (
                              <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-white/60 mt-1 line-clamp-2">
                            {notification.mensaje}
                          </p>
                          <p className="text-xs text-white/40 mt-2">
                            {new Date(notification.fechaCreacion).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            {!notification.leida && (
                              <button
                                onClick={() => handleMarkAsRead(notification.idNotificacion)}
                                className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Leída
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.idNotificacion)}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
