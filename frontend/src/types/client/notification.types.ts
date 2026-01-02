export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Notification {
  idNotificacion: number;
  idUsuario: number;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}
