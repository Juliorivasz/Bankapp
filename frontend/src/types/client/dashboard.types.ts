import type { DateRange } from "react-day-picker";

// Tipos base del backend
export interface WalletInfoDTO {
    idWallet: number;
    numeroCuenta: string;
    balance: number;
    monedaNombre: string;
    monedaSimbolo: string;
    estado: string;
}

export interface TransaccionInfoDTO {
    idTransaccion: number;
    fecha: string;
    descripcion: string;
    monto: number;
    tipo: string;
    balanceAcumulado: number;
    estado: string;
}

export interface EstadisticasDTO {
    totalTransacciones: number;
    totalIngresos: number;
    totalEgresos: number;
}

// DTO para Validación de Destinatario
export interface DestinatarioDTO {
  idUsuario: number;
  nombreCompleto: string;
  alias: string;
  cbu: string;
  banco: string;
}

export interface DashboardResponse {
    nombreUsuario: string;
    balanceTotal: number;
    wallets: WalletInfoDTO[];
    transaccionesRecientes: TransaccionInfoDTO[];
    estadisticas: EstadisticasDTO;
    balanceDiario: BalanceDiarioDTO[];
}

export interface BalanceDiarioDTO {
  fecha: string;
  ingresos: number;
  egresos: number;
}

// Tipos para props de componentes (UI)
// Mapedos desde los DTOs
export type Wallet = {
  id: string;
  accountNumber: string; // CBU/CVU
  currency: string;
  code: string;
  balance: number;
  primaryValue: number; 
  flag: string;
};

export type Transaction = {
  id: number;
  type: 'send' | 'receive' | 'top-up' | 'unknown';
  amount: number;
  currency: string;
  name: string;
  date: string;
  description?: string;
};

export type ChartData = {
  date: string; 
  balance: number;
  type: string;
  fullDate: string;
  amount: number;
  fromTo: string;
};

export interface BalancePanelProps {
  wallets: Wallet[];
  totalBalance: number;
  isHidden: boolean;
  onToggleVisibility: () => void;
}

export interface MovementsChartProps {
  data: ChartData[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export interface TransactionsTableProps {
  transactions: Transaction[];
}