import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Lock, Save, Eye, EyeOff, Shield, Bell, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { profileService } from '../../service/profile.service';
import type { ProfileData, UpdateProfileData, ChangePasswordData } from '../../types/client/profile.types';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<UpdateProfileData>({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    numeroTelefono: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    passwordActual: '',
    passwordNueva: '',
    passwordNuevaConfirmacion: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmacion: false
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfileData(data);
      setFormData({
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: data.fechaNacimiento,
        numeroTelefono: data.numeroTelefono,
        email: data.email
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(formData);
      setProfileData(updated);
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.passwordNueva !== passwordData.passwordNuevaConfirmacion) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.passwordNueva.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);
    try {
      await profileService.changePassword(passwordData);
      toast.success('Contraseña cambiada correctamente');
      setPasswordData({
        passwordActual: '',
        passwordNueva: '',
        passwordNuevaConfirmacion: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] text-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Cargando perfil...</p>
        </div>
      </div>
    );
  }

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
            <User className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Mi Perfil
          </h1>
        </div>
        <p className="text-base sm:text-lg text-white/70">
          Gestiona tu información personal y preferencias.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info & Password */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--color-primary)]" />
              Información Personal
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 focus:border-transparent outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.numeroTelefono}
                  onChange={(e) => setFormData({ ...formData, numeroTelefono: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--color-primary)]" />
              Cambiar Contraseña
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.actual ? 'text' : 'password'}
                    value={passwordData.passwordActual}
                    onChange={(e) => setPasswordData({ ...passwordData, passwordActual: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, actual: !showPasswords.actual })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPasswords.actual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.nueva ? 'text' : 'password'}
                    value={passwordData.passwordNueva}
                    onChange={(e) => setPasswordData({ ...passwordData, passwordNueva: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, nueva: !showPasswords.nueva })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPasswords.nueva ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmacion ? 'text' : 'password'}
                    value={passwordData.passwordNuevaConfirmacion}
                    onChange={(e) => setPasswordData({ ...passwordData, passwordNuevaConfirmacion: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirmacion: !showPasswords.confirmacion })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPasswords.confirmacion ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Lock className="w-5 h-5" />
                {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Column - Account Info & Settings */}
        <div className="space-y-6">
          
          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-primary)]" />
              Información de Cuenta
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/60 mb-1">Nombre de Usuario</p>
                <p className="font-medium">{profileData?.nombreUsuario}</p>
              </div>

              <div className="h-px bg-white/10"></div>

              <div>
                <p className="text-sm text-white/60 mb-1">Fecha de Creación</p>
                <p className="font-medium">
                  {profileData?.fechaCreacion ? new Date(profileData.fechaCreacion).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>

              <div className="h-px bg-white/10"></div>

              <div>
                <p className="text-sm text-white/60 mb-1">Estado de Cuenta</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  profileData?.estadoCuenta === 'ACTIVA' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {profileData?.estadoCuenta}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Preferences - UI Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--color-primary)]" />
              Preferencias
            </h2>

            <div className="space-y-4 opacity-50">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Idioma
                </label>
                <select 
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white cursor-not-allowed"
                >
                  <option>Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Moneda Base
                </label>
                <select 
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white cursor-not-allowed"
                >
                  <option>ARS - Peso Argentino</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <AlertCircle className="w-4 h-4" />
                <span>Próximamente disponible</span>
              </div>
            </div>
          </motion.div>

          {/* Notifications - UI Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--color-primary)]" />
              Notificaciones
            </h2>

            <div className="space-y-4 opacity-50">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificaciones por Email</span>
                <input type="checkbox" disabled className="cursor-not-allowed" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Alertas de Transacciones</span>
                <input type="checkbox" disabled className="cursor-not-allowed" />
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <AlertCircle className="w-4 h-4" />
                <span>Próximamente disponible</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
