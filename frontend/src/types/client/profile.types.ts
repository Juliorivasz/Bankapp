// Profile Types
export interface ProfileData {
  nombreUsuario: string;
  email: string;
  fechaCreacion: string;
  estadoCuenta: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  numeroTelefono: string;
}

export interface UpdateProfileData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  numeroTelefono: string;
  email: string;
}

export interface ChangePasswordData {
  passwordActual: string;
  passwordNueva: string;
  passwordNuevaConfirmacion: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  marketingEmails: boolean;
}

export interface UserPreferences {
  language: string;
  currency: string;
  theme: 'light' | 'dark';
}
