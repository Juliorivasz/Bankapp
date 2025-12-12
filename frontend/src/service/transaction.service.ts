import apiClient from './apiClient';
import { Loader } from '../components/ui/Loader';

// Tipos para los filtros
export interface TransactionFilters {
  idWallet?: string;
  fechaInicio?: string; // ISO string
  fechaFin?: string;    // ISO string
  tipo?: string;
  busqueda?: string;
  page: number;
  size: number;
}

// Tipo de respuesta paginada (Spring Page)
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page index (0-based)
  first: boolean;
  last: boolean;
  empty: boolean;
}

const searchTransactions = async (filters: TransactionFilters) => {
  const params = new URLSearchParams();
  
  if (filters.idWallet) params.append('idWallet', filters.idWallet);
  if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.busqueda) params.append('busqueda', filters.busqueda);
  
  params.append('page', filters.page.toString());
  params.append('size', filters.size.toString());

  const response = await apiClient.get(`/cliente/transacciones/busqueda`, { params });
  return response.data as Page<any>; // Tipar 'any' con Transaction type real si está disponible
};

export const transactionService = {
  searchTransactions
};
