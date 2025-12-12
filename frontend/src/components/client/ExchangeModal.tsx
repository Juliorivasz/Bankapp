import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { walletService } from '../../service/wallet.service';
import { exchangeService } from '../../service/exchange.service';
import { formatCurrency } from '../../utils/coinFormat';
import type { Wallet } from '../../types/client/dashboard.types';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSuccess: () => void;
  initialSourceWalletId?: string; // Prop opcional para preseleccionar wallet origen
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({ isOpen, onClose, wallets, onSuccess, initialSourceWalletId }) => {
  const [sourceWalletId, setSourceWalletId] = useState<string | null>(null);
  const [targetWalletId, setTargetWalletId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  // Initialize state when opening
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setLoading(false);
      
      // Determine source ID: use prop if valid, otherwise first wallet
      // Ensure source exists in the provided wallets list
      // Convert initialSourceWalletId to string for comparison if needed
      const initialIdStr = initialSourceWalletId?.toString();
      
      const validSourceId = initialIdStr && wallets.find(w => w.id === initialIdStr)
          ? initialIdStr
          : wallets.length > 0 ? wallets[0].id : null;
      
      setSourceWalletId(validSourceId);

      // Determine target ID: try to find a different wallet than source
      if (wallets.length > 1 && validSourceId) {
          const defaultTarget = wallets.find(w => w.id !== validSourceId);
          setTargetWalletId(defaultTarget ? defaultTarget.id : null);
      } else if (wallets.length > 0) {
           setTargetWalletId(wallets[0].id);
      }

      loadRates();
    }
  }, [isOpen, wallets, initialSourceWalletId]);

  const loadRates = async () => {
    try {
        const r = await exchangeService.getRates();
        setRates(r);
    } catch (e) {
        console.error("Error loading rates", e);
        toast.error("No se pudieron cargar las tasas de cambio.");
    }
  };

  const sourceWallet = wallets.find(w => w.id === sourceWalletId);
  const targetWallet = wallets.find(w => w.id === targetWalletId);

  // Exchange Calculation
  const exchangeInfo = useMemo(() => {
      if (!sourceWallet || !targetWallet || !rates || !amount) return null;
      
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return null;

      // 1. Convert Source -> USD Base
      const amountInUSD = sourceWallet.code === 'USD' 
          ? numAmount 
          : numAmount / rates[sourceWallet.code];

      // 2. Convert USD Base -> Target
      const amountInTarget = targetWallet.code === 'USD'
          ? amountInUSD
          : amountInUSD * rates[targetWallet.code];

      // Exchange Rate (1 Source = X Target)
      const oneSourceToTarget = (1 / rates[sourceWallet.code]) * rates[targetWallet.code];

      return {
          finalAmount: amountInTarget,
          rate: oneSourceToTarget
      };
  }, [sourceWallet, targetWallet, rates, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWallet || !targetWallet || !exchangeInfo) return;

    if (sourceWallet.id === targetWallet.id) {
        toast.error("No puedes convertir a la misma wallet.");
        return;
    }

    setLoading(true);
    try {
      await walletService.intercambiar({
          numeroCuentaOrigen: sourceWallet.accountNumber,
          numeroCuentaDestino: targetWallet.accountNumber,
          montoOrigen: parseFloat(amount),
          tasaConversion: exchangeInfo.rate
      });
      toast.success(`Conversión exitosa! Recibiste ${formatCurrency(exchangeInfo.finalAmount, targetWallet.code)}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error en la conversión");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="text-[var(--color-primary)]" />
              Conversión de Divisas
            </h2>
            <p className="text-sm text-white/50">Intercambia saldo entre tus cuentas al instante</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Wallet Selectors */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                {/* Source */}
                <div className="space-y-2">
                    <label className="text-xs uppercase text-white/50 font-bold tracking-wider">Desde (Origen)</label>
                    <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none"
                        value={sourceWalletId || ''}
                        onChange={e => setSourceWalletId(e.target.value)}
                    >
                        {wallets.map(w => (
                            <option key={w.id} value={w.id} disabled={w.id === targetWalletId}>
                                {w.flag} {w.currency} ({formatCurrency(w.balance, w.code)})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center pt-6 text-white/30">
                    <ArrowRight className="w-6 h-6" />
                </div>

                 {/* Target */}
                 <div className="space-y-2">
                    <label className="text-xs uppercase text-white/50 font-bold tracking-wider">Hacia (Destino)</label>
                    <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none"
                        value={targetWalletId || ''}
                        onChange={e => setTargetWalletId(e.target.value)}
                    >
                         {wallets
                            .filter(w => w.id !== sourceWalletId) // Filter out source logic handling
                            .map(w => (
                            <option key={w.id} value={w.id}>
                                {w.flag} {w.currency}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
                <label className="text-xs uppercase text-white/50 font-bold tracking-wider">Monto a Convertir ({sourceWallet?.code})</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">$</span>
                    <input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-8 text-2xl font-bold text-white focus:outline-none focus:border-[var(--color-primary)] placeholder:text-white/20"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>
                {sourceWallet && (
                    <p className="text-right text-xs text-white/50">
                        Disponible: <span className="text-[var(--color-primary)]">{formatCurrency(sourceWallet.balance, sourceWallet.code)}</span>
                    </p>
                )}
            </div>

            {/* Conversion Preview */}
            <AnimatePresence>
                {exchangeInfo && sourceWallet && targetWallet && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3"
                    >
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-200">Tasa de cambio:</span>
                            <span className="text-white font-mono">
                                1 {sourceWallet.code} ≈ {exchangeInfo.rate.toFixed(4)} {targetWallet.code}
                            </span>
                        </div>
                        <div className="h-px bg-blue-500/20" />
                        <div className="flex justify-between items-center">
                            <span className="text-blue-200">Recibirás aprox:</span>
                            <span className="text-xl font-bold text-blue-400">
                                {formatCurrency(exchangeInfo.finalAmount, targetWallet.code)}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={loading || !exchangeInfo}
                    className="flex-1 px-4 py-3 bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Confirmar
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

        </form>
      </motion.div>
    </div>
  );
};
