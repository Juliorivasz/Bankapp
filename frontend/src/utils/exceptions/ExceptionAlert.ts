import { Slide, toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 4000,
  transition: Slide,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export class ExceptionAlert {
  
  /**
   * Muestra una notificación de éxito (Verde)
   * @param message El mensaje a mostrar
   */
  static success(message: string) {
    toast.success(message, defaultOptions);
  }

  /**
   * Muestra una notificación de error (Rojo)
   * @param message El mensaje a mostrar
   */
  static error(message: string) {
    toast.error(message, defaultOptions);
  }

  /**
   * Muestra una notificación de advertencia (Amarillo)
   * @param message El mensaje a mostrar
   */
  static warning(message: string) {
    toast.warning(message, defaultOptions);
  }

  /**
   * Muestra una notificación de información (Azul)
   * @param message El mensaje a mostrar
   */
  static info(message: string) {
    toast.info(message, defaultOptions);
  }

  /**
   * Muestra una notificación personalizada (útil para promesas o estilos raros)
   */
  static custom(message: string, options?: ToastOptions) {
    toast(message, { ...defaultOptions, ...options });
  }
}