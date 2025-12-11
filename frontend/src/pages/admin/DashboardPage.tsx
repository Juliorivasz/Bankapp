"use client"

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';

import { type DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { useAuthStore } from '../../store/auth.store';
import type { ChartData, Transaction, Wallet, DashboardResponse, WalletInfoDTO, TransaccionInfoDTO } from '../../types/client/dashboard.types';
import { BalancePanel } from '../../components/client/BalancePanel';
import { MovementsChart } from '../../components/client/MovementsChart';
import { TransactionsTable } from '../../components/client/TransactionsTable';
import { dashboardService } from '../../service/dashboard.service';


const getFlag = (code: string) => {
  switch (code) {
    case 'ARS': return '🇦🇷';
    case 'USD': return '🇺🇸';
    case 'EUR': return '🇪🇺';
    case 'BRL': return '🇧🇷';
    case 'BTC': return '₿';
    default: return '💰';
  }
};

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // Pasar las fechas al servicio (si existen)
        const from = dateRange?.from;
        const to = dateRange?.to;
        
        const data = await dashboardService.getDashboard(from, to);
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dateRange]); // Recargar cuando cambie el rango de fechas

  // Mapear datos del backend a formatos del frontend

  const wallets: Wallet[] = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.wallets.map((w: WalletInfoDTO) => ({
      id: w.idWallet.toString(),
      accountNumber: w.numeroCuenta,
      currency: w.monedaNombre,
      code: w.monedaSimbolo, 
      balance: w.balance,
      primaryValue: w.balance,
      flag: getFlag(w.monedaSimbolo)
    }));
  }, [dashboardData]);

  const recentTransactions: Transaction[] = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.transaccionesRecientes.map((t: TransaccionInfoDTO) => ({
      id: t.idTransaccion,
      type: mapTransactionType(t.tipo),
      amount: t.monto,
      currency: "ARS", // Idealmente vendría del backend
      name: t.descripcion || "Transacción",
      date: t.fecha, 
      description: t.descripcion
    }));
  }, [dashboardData]);
  
  // No necesitamos 'chartData' transformado localmente, usamos 'balanceDiario' directo del backend.

  function mapTransactionType(type: string): 'send' | 'receive' {
    if (type === 'DEPOSITO' || type === 'TRANSFERENCIA_RECIBIDA') return 'receive';
    return 'send';
  }

  // Usar balance total del backend, o calcularlo si es necesario (el backend ya manda suma simple)
  // Nota: convertir a número si viene como string
  const totalBalance = dashboardData ? dashboardData.balanceTotal : 0;

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[var(--color-background)] text-white">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-[var(--color-primary)] border-r-transparent border-b-[var(--color-primary)] border-l-transparent animate-spin mb-4"></div>
            <p className="text-lg">Cargando tu actividad financiera...</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-full flex items-center justify-center bg-[var(--color-background)] text-white p-6">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error de Conexión</h2>
            <p className="text-white/80">{error}</p>
            <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
            >
                Reintentar
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] text-white p-4 sm:p-6 lg:p-8">
      
      {/* Encabezado de Bienvenida */}
      <div className="mb-8 animate-fadeIn flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Bienvenido de nuevo, <span className="text-[var(--color-primary)]">{user?.sub || dashboardData?.nombreUsuario || 'Usuario'}</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 mt-1">Aquí está el resumen de tu actividad financiera.</p>
        </div>
        
        <button
            onClick={() => navigate('/transferir')}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
        >
            <Send className="w-5 h-5" />
            Transferir
        </button>
      </div>

      {/* Contenedor Principal del Dashboard */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Panel de Saldo */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <BalancePanel 
            wallets={wallets}
            totalBalance={totalBalance}
            isHidden={isBalanceHidden}
            onToggleVisibility={() => setIsBalanceHidden(!isBalanceHidden)}
          />
        </div>

        {/* Panel de Gráfico */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <MovementsChart 
              data={dashboardData?.balanceDiario || []} 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
            />
          </div>
        
        {/* Panel de Transacciones */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <TransactionsTable transactions={recentTransactions} />
        </div>

      </div>
    </div>
  );
}
