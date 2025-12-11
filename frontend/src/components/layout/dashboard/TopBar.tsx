import { Menu, Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';

interface TopBarProps {
  onMenuClick: () => void;
}

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/wallets': 'Mis Wallets',
  '/transactions': 'Transacciones',
  '/profile': 'Mi Perfil',
  '/settings': 'Configuración',
};

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const currentRoute = routeNames[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-background)]/80 backdrop-blur-xl border-b border-white/10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Menu Button + Breadcrumbs */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/50">Inicio</span>
              <ChevronRight className="w-4 h-4 text-white/30" />
              <span className="text-white font-medium">{currentRoute}</span>
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <Bell className="w-5 h-5" />
              {/* Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.sub || 'Usuario'}</p>
                <p className="text-xs text-white/50">
                  {user?.roles?.[0]?.replace('ROLE_', '') || 'Cliente'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-white font-bold">
                {user?.sub?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
