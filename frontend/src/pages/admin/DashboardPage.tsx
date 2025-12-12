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
import { useCurrencyStore } from '../../store/currency.store';
import { exchangeService } from '../../service/exchange.service';
import { getFlag } from '../../utils/currencyUtils';

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Estado para la conversión visual (Selector "Valor total aprox")
  // Por defecto USD, pero el usuario puede cambiarlo para ver su patrimonio en otra moneda
  const { baseCurrency, setBaseCurrency } = useCurrencyStore();
  
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch de tasas de cambio
  useEffect(() => {
    const fetchRates = async () => {
        const fetchedRates = await exchangeService.getRates();
        setRates(fetchedRates);
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
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
  }, [dateRange]);

  // Mapear Wallets
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

  // Inicializar selectedWalletId cuando cargan las wallets
  useEffect(() => {
      if (wallets.length > 0 && !selectedWalletId) {
          setSelectedWalletId(wallets[0].id);
      }
  }, [wallets, selectedWalletId]);

  const selectedWallet = useMemo(() => {
      return wallets.find(w => w.id === selectedWalletId) || wallets[0];
  }, [wallets, selectedWalletId]);


  // 2. Mapeo de Transacciones FILTRADAS por Wallet Seleccionada
  const recentTransactions: Transaction[] = useMemo(() => {
    if (!dashboardData || !rates || !selectedWallet) return [];
    
    // Filtramos solo las transacciones de esta wallet
    const walletTransactions = dashboardData.transaccionesRecientes.filter(t => 
        t.numeroCuenta === selectedWallet.accountNumber
    );

    return walletTransactions.map((t: TransaccionInfoDTO) => {
        // Como estamos filtrando por wallet, el monto YA ES en la moneda de la wallet.
        // Pero el usuario puede querer ver todo en su "convertidor" (baseCurrency).
        // El requerimiento dice: "debe mostrarse segun la wallet elegida".
        // Entonces mostramos en la moneda de la WALLET, no en la BaseCurrency del convertidor inferior.
        
        // WAIT: El usuario dijo "el que dice valor total aprox es a cual conversion quiero que me muestre... al cambiar la wallet se debe poder actualizar globalmente"
        // PERO TAMBIEN: "los graficos y transacciones debe mostrarse segun la wallet elegida".
        // INTERPRETACION:
        // - Lista de transacciones: Moneda de la Wallet.
        // - Gráfico: Moneda de la Wallet.
        // - Total Global (abajo): Convertido a baseCurrency.

        return {
            id: t.idTransaccion,
            type: mapTransactionType(t.tipo),
            amount: t.monto, // Monto original de la transacción (moneda de la wallet)
            currency: selectedWallet.code, // Moneda de la wallet
            name: t.descripcion || "Transacción",
            date: t.fecha, 
            description: t.descripcion
        };
    });
  }, [dashboardData, rates, selectedWallet]); // Removing baseCurrency dep if not converting transactions to it
  
  // 3. Recálculo del Gráfico (Balance Diario) para la Wallet Seleccionada
  const chartData = useMemo(() => {
      if (!dashboardData?.transaccionesRecientes || !selectedWallet) return [];

      // Filtramos transacciones
      const walletTransactions = dashboardData.transaccionesRecientes.filter(t => 
        t.numeroCuenta === selectedWallet.accountNumber
      );

      // Reconstruir lógica de agrupación por día (frontend side)
      const map: Record<string, { fecha: string, ingresos: number, egresos: number }> = {};

      walletTransactions.forEach(t => {
          const fechaDia = t.fecha.substring(0, 10);
          if (!map[fechaDia]) {
              map[fechaDia] = { fecha: fechaDia, ingresos: 0, egresos: 0 };
          }
          
          if (mapTransactionType(t.tipo) === 'receive') {
              map[fechaDia].ingresos += t.monto;
          } else {
              map[fechaDia].egresos += t.monto;
          }
      });

      // Convertir a array y ordenar
      const sortedData = Object.values(map).sort((a, b) => a.fecha.localeCompare(b.fecha));
      
      // Mapear al formato del gráfico
      return sortedData.map(item => ({
         fecha: item.fecha, // Required by BalanceDiarioDTO
         date: item.fecha, 
         fullDate: item.fecha, 
         ingresos: item.ingresos,
         egresos: item.egresos,
         balance: 0, 
         type: 'mixed',
         amount: 0,
         fromTo: ''
      }));
  }, [dashboardData, selectedWallet]);

  function mapTransactionType(type: string): 'send' | 'receive' {
    if (type === 'DEPOSITO' || type === 'TRANSFERENCIA_RECIBIDA') return 'receive';
    return 'send';
  }

  // CALCULO DEL BALANCE TOTAL DINÁMICO (Panel Inferior)
  const totalBalance = useMemo(() => {
      // Ahora el valor total aproximado refleja SOLO la wallet seleccionada convertida a la moneda base.
      if (!selectedWallet || !rates) return 0;
      
      return exchangeService.convert(
          selectedWallet.balance, 
          selectedWallet.code, 
          baseCurrency, 
          rates
      );
  }, [selectedWallet, rates, baseCurrency]);

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
            baseCurrency={baseCurrency}
            onCurrencyChange={setBaseCurrency}
            selectedWallet={selectedWallet}
            onWalletChange={(w) => setSelectedWalletId(w.id)}
          />
        </div>

        {/* Panel de Gráfico */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <MovementsChart 
              data={chartData} 
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
