import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Wallet, 
  ArrowLeftRight, 
  User, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuthStore } from '../../../store/auth.store';
import Logo from '../../atoms/Logo';
import { LogoutModal } from '../../auth/LogoutModal';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Mis Wallets', path: '/wallets', icon: Wallet },
  { name: 'Transacciones', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Mi Perfil', path: '/profile', icon: User },
  { name: 'Configuración', path: '/settings', icon: Settings },
];

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
      logout();
      navigate('/login');
      setShowLogoutModal(false);
  };

  return (
    <>
      {/* Desktop Sidebar - Using CSS transitions instead of Framer Motion */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 overflow-hidden ${
          isCollapsed ? 'w-20' : 'w-[280px]'
        }`}
        style={{ 
          willChange: 'width',
          transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="h-full w-full flex flex-col bg-gradient-to-b from-blue-950 to-blue-900 border-r border-white/10 relative overflow-hidden">
          {/* Header */}
          <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-white/10 flex-shrink-0`}>
             <div className="flex items-center justify-between w-full">
               <div className="flex items-center justify-center w-full transition-all duration-300">
                  <Logo showText={!isCollapsed} />
               </div>
             </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.sub?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div 
                className={`flex-1 min-w-0 transition-all duration-300 ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
                style={{ transitionDelay: isCollapsed ? '0ms' : '100ms' }}
              >
                {!isCollapsed && (
                  <>
                    <p className="text-white font-semibold truncate">{user?.sub || 'Usuario'}</p>

                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                    <span 
                      className={`font-medium whitespace-nowrap transition-all duration-300 ${
                        isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                      }`}
                      style={{ transitionDelay: isCollapsed ? '0ms' : '100ms' }}
                    >
                      {!isCollapsed && item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span 
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
                style={{ transitionDelay: isCollapsed ? '0ms' : '100ms' }}
              >
                {!isCollapsed && 'Cerrar Sesión'}
              </span>
            </button>
          </div>

          {/* Collapse Toggle Button - More visible */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-white z-50"
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <div
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
            />

            {/* Drawer */}
            <aside
              className={`lg:hidden fixed left-0 top-0 bottom-0 w-80 z-50 transition-transform duration-300 ${
                isMobileOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="h-full flex flex-col bg-gradient-to-b from-blue-950 to-blue-900 border-r border-white/10">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <Logo />
                    <button
                      onClick={onMobileClose}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-white font-bold">
                      {user?.sub?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{user?.sub || 'Usuario'}</p>

                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                          isActive
                            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                          <span className="font-medium">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </aside>
          </>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
