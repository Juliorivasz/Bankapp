import { format } from "date-fns";
import type { ChartData } from "../types/client/dashboard.types";
import { es } from "date-fns/locale";

// Función de utilidad para formatear moneda
/**
 * Convierte una cantidad numérica a formato de moneda (ARS por defecto).
 * @param amount Cantidad a formatear.
 * @param code Código de moneda (e.g., 'ARS').
 * @returns Cadena de moneda formateada.
 */
export const formatCurrency = (amount: number, code: string = 'ARS'): string => {
    // Usamos Intl.NumberFormat para un formateo más robusto y localizado
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Transforma y ordena los datos del gráfico, añadiendo un timestamp numérico único.
 * Esto permite trazar el balance con precisión.
 * @param data Datos de movimientos.
 * @returns Datos transformados y ordenados por timestamp.
 */
export const transformChartData = (data: ChartData[]) => {
    return data.map(item => {
        // Usa Date.parse para obtener el timestamp en milisegundos a partir de la fecha/hora completa
        const timestampMs = Date.parse(item.fullDate); 
        return {
            ...item,
            timestampMs, // Clave numérica para el eje X
        };
    }).sort((a, b) => a.timestampMs - b.timestampMs); // Ordenamos cronológicamente
};

/**
 * Formatea un timestamp numérico a una cadena de fecha legible (DD/MM) para el Eje X.
 * @param tick Timestamp numérico.
 * @returns Fecha formateada.
 */
export const xAxisFormatter = (tick: number): string => {
    if (!tick) return ''; 
    // Muestra la fecha corta para mantener la legibilidad
    return format(new Date(tick), 'dd/MM', { locale: es });
};