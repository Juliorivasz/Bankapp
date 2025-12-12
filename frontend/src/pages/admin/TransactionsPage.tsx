import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Wallet as WalletIcon,
  Download
} from 'lucide-react';
import { walletService } from '../../service/wallet.service';
import { transactionService } from '../../service/transaction.service';
import { Loader } from '../../components/ui/Loader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Tipos locales
interface Transaction {
  idTransaccion: number;
  tipoTransaccion: string;
  monto: number;
  fechaTransaccion: string;
  descripcion: string;
  numeroCuenta: string;
  estadoTransaccion: string;
  cuentaDestino: string;
}

interface Wallet {
  idWallet: number;
  numeroCuenta: string;
  monedaSimbolo: string;
  monedaNombre: string;
}

export default function TransactionsPage() {
  // Estados de datos
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados de filtros
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('');
  
  // Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Cargar Wallets al inicio
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const data = await walletService.getWallets();
        setWallets(data);
        if (data.length > 0) {
          setSelectedWalletId(data[0].idWallet.toString());
        }
      } catch (error) {
        toast.error("Error al cargar billeteras");
      }
    };
    fetchWallets();
  }, []);

  // Función de búsqueda
  const fetchTransactions = useCallback(async () => {
    if (!selectedWalletId) return;

    setLoading(true);
    try {
      const result = await transactionService.searchTransactions({
        idWallet: selectedWalletId,
        page: page,
        size: pageSize,
        fechaInicio: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        fechaFin: dateTo ? new Date(dateTo).toISOString() : undefined,
        busqueda: searchTerm,
        tipo: transactionType || undefined
      });
      
      setTransactions(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error(error);
      toast.error("Error al buscar transacciones");
    } finally {
      setLoading(false);
    }
  }, [selectedWalletId, page, dateFrom, dateTo, searchTerm, transactionType]);

  // Efecto para buscar cuando cambian los filtros (con debounce para search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTransactions();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchTransactions]);

  // Reset page cuando cambian filtros
  useEffect(() => {
    setPage(0);
  }, [selectedWalletId, dateFrom, dateTo, searchTerm, transactionType]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXITO': return 'bg-green-500/10 text-green-500';
      case 'PENDIENTE': return 'bg-yellow-500/10 text-yellow-500';
      case 'FALLIDO': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatCurrency = (amount: number, walletId: string) => {
    const wallet = wallets.find(w => w.idWallet.toString() === walletId);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: wallet?.monedaSimbolo || 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-full bg-[var(--color-background)] text-white p-4 sm:p-6 lg:p-8 pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-primary)]/20 rounded-xl">
            <ArrowLeftRight className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Transacciones</h1>
            <p className="text-white/60 text-sm">Gestiona y filtra tus movimientos</p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-[#1f2937] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Selector de Wallet */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Billetera</label>
            <div className="relative">
              <WalletIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none"
              >
                {wallets.map(w => (
                  <option key={w.idWallet} value={w.idWallet} className="bg-[#1f2937]">
                    {w.monedaNombre} ({w.monedaSimbolo}) - {w.numeroCuenta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buscador de Texto */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Descripción, monto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Rango de Fechas */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-2">
             <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Periodo</label>
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <input
                   type="date"
                   value={dateFrom}
                   onChange={(e) => setDateFrom(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors [color-scheme:dark]"
                 />
               </div>
               <span className="self-center text-gray-500">-</span>
               <div className="relative flex-1">
                 <input
                   type="date"
                   value={dateTo}
                   onChange={(e) => setDateTo(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors [color-scheme:dark]"
                 />
               </div>
             </div>
          </div>

           {/* Tipo de Transacción */}
           <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none"
              >
                <option value="" className="bg-[#1f2937]">Todos</option>
                <option value="TRANSFERENCIA_ENVIADA" className="bg-[#1f2937]">Enviado</option>
                <option value="TRANSFERENCIA_RECIBIDA" className="bg-[#1f2937]">Recibido</option>
                <option value="DEPOSITO" className="bg-[#1f2937]">Depósito</option>
                <option value="RETIRO" className="bg-[#1f2937]">Retiro</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* RESULTADOS */}
      {loading && transactions?.length === 0 ? (
        <Loader text="Buscando transacciones..." />
      ) : (
        <>
        <div className="bg-[#1f2937] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {transactions?.length > 0 ? transactions.map((tx) => (
                  <tr key={tx.idTransaccion} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-300 whitespace-nowrap">
                      {format(new Date(tx.fechaTransaccion), "dd MMM yyyy, HH:mm", { locale: es })}
                    </td>
                    <td className="p-4 text-white font-medium">
                      <div className="flex flex-col">
                        <span>{tx.descripcion}</span>
                        {tx.cuentaDestino && <span className="text-xs text-gray-500">Dest: {tx.cuentaDestino}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {tx.tipoTransaccion.replace('_', ' ')}
                      </span>
                    </td>
                     <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border border-white/5 ${getStatusColor(tx.estadoTransaccion)}`}>
                        {tx.estadoTransaccion}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold ${tx.monto < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(tx.monto, selectedWalletId)}
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500">
                            No se encontraron transacciones con estos filtros.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACION */}
          {totalPages > 0 && (
             <div className="border-t border-white/10 p-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                    Mostrando {transactions.length} de {totalElements} resultados
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="flex items-center px-4 text-sm text-white font-medium bg-white/5 rounded-lg border border-white/10">
                        Página {page + 1} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
