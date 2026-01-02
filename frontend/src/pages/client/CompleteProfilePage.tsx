import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { profileService } from '../../service/profile.service';
import type { UpdateProfileData } from '../../types/client/profile.types';
import { useAuthStore } from '../../store/auth.store';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    numeroTelefono: '',
    email: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        setFormData({
          nombre: profile.nombre === 'PENDIENTE' ? '' : profile.nombre,
          apellido: profile.apellido === 'PENDIENTE' ? '' : profile.apellido,
          email: profile.email,
          numeroTelefono: profile.numeroTelefono || '',
          // Si la fecha viene como array o string, asegurarse formato YYYY-MM-DD
          fechaNacimiento: profile.fechaNacimiento ? String(profile.fechaNacimiento) : ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar datos del perfil');
      }
    };
    loadProfile();
  }, []);

  const { setProfileComplete } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.fechaNacimiento || !formData.numeroTelefono || !formData.email) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await profileService.updateProfile(formData);
      setProfileComplete(true); // Actualizar estado en el store
      toast.success('¡Perfil completado exitosamente!');
      
      // Redirigir al dashboard
      setTimeout(() => {
        navigate('/dashboard'); 
      }, 1000);
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast.error(error.response?.data?.message || 'Error al completar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Alert Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-400 mb-1">Completa tu perfil para continuar</h3>
            <p className="text-sm text-yellow-200/80">
              Para poder acceder a todas las funcionalidades de la aplicación, necesitamos que completes tu información personal.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--color-card)]/70 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[var(--color-primary)]/20 rounded-xl">
              <User className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Completa tu Perfil</h1>
              <p className="text-white/60 text-sm">
                Hola <span className="text-[var(--color-primary)]">{formData.email}</span>, necesitamos unos datos más.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Apellido *
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

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.numeroTelefono}
                onChange={(e) => setFormData({ ...formData, numeroTelefono: e.target.value })}
                placeholder="+54 9 11 1234-5678"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-200/80">
                Tus datos están protegidos y solo se utilizarán para mejorar tu experiencia en la plataforma.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-[var(--color-primary)]/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Completando perfil...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Completar Perfil
                </>
              )}
            </button>

            <p className="text-center text-xs text-white/40">
              * Todos los campos son obligatorios
            </p>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-white/40 mt-6">
          ¿Necesitas ayuda? Contacta a{' '}
          <a href="mailto:soporte@bankapp.com" className="text-[var(--color-primary)] hover:underline">
            soporte@bankapp.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
