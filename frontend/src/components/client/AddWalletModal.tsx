import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Wallet, Search, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { walletService } from '../../service/wallet.service';
import type { Wallet as WalletType } from '../../types/client/dashboard.types';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingWallets: WalletType[];
}

const AVAILABLE_CURRENCIES = [
    { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷' },
    { code: 'USD', name: 'Dólar Estadounidense', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'BRL', name: 'Real Brasileño', flag: '🇧🇷' },
    { code: 'BTC', name: 'Bitcoin', flag: '₿' },
    { code: 'ETH', name: 'Ethereum', flag: 'Ξ' },
    { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
    { code: 'JPY', name: 'Yen Japonés', flag: '🇯🇵' },
];

export const AddWalletModal: React.FC<AddWalletModalProps> = ({ isOpen, onClose, onSuccess, existingWallets }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = useMemo(() => {
    // 1. Filtrar las que ya tiene el usuario
    const available = AVAILABLE_CURRENCIES.filter(c => 
        !existingWallets.some(w => w.code === c.code)
    );

    // 2. Filtrar por búsqueda
    return available.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, existingWallets]);

  const handleSubmit = async () => {
      if (!selectedCurrency) return;
      setLoading(true);
      try {
          await walletService.createWallet(selectedCurrency);
          toast.success(`Wallet de ${selectedCurrency} creada con éxito`);
          onSuccess();
          onClose();
      } catch (error: any) {
          console.error(error);
          toast.error(error.response?.data?.message || "Error al crear la wallet");
      } finally {
          setLoading(false);
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
          >
            {/* Header Sticky */}
            <div className="p-6 sm:p-8 bg-[#0f172a] z-10 border-b border-white/5">
                <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                >
                <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Nueva Billetera</h3>
                        <p className="text-white/50 text-sm">Elige una moneda para comenzar a operar</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[var(--color-primary)] transition-colors w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Buscar moneda (ej: USD, Euro...)" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[var(--color-primary)]/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/20 outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all"
                        autoFocus
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                {filteredCurrencies.length === 0 ? (
                    <div className="text-center py-10 text-white/30 flex flex-col items-center">
                         {AVAILABLE_CURRENCIES.every(c => existingWallets.some(w => w.code === c.code)) && !searchTerm ? (
                            <>
                                <Check className="w-12 h-12 mb-4 text-green-500/50" />
                                <p className="font-bold text-white/60">¡Ya tienes todas las wallets disponibles!</p>
                            </>
                         ) : (
                            <>
                                <Search className="w-12 h-12 mb-4 opacity-50" />
                                <p>No encontramos esa moneda.</p>
                            </>
                         )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredCurrencies.map((curr) => (
                            <button
                                key={curr.code}
                                onClick={() => setSelectedCurrency(curr.code)}
                                className={`relative group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                    selectedCurrency === curr.code
                                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-[0_0_20px_-5px_var(--color-primary)]'
                                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                }`}
                            >
                                <span className="text-3xl filter drop-shadow-md">{curr.flag}</span>
                                <div className="text-left flex-1">
                                    <p className={`font-bold transition-colors ${selectedCurrency === curr.code ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                                        {curr.name}
                                    </p>
                                    <p className="text-xs font-mono text-white/40 group-hover:text-white/60 transition-colors">{curr.code}</p>
                                </div>
                                
                                {/* Selection Indicator */}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedCurrency === curr.code
                                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] scale-100'
                                    : 'border-white/10 group-hover:border-white/30 scale-90 opacity-50 group-hover:opacity-100'
                                }`}>
                                    {selectedCurrency === curr.code && <Check className="w-3 h-3 text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 sm:p-8 pt-0 mt-auto bg-[#0f172a] border-t border-white/5 z-10 pt-6">
                <button 
                    onClick={handleSubmit}
                    disabled={loading || !selectedCurrency}
                    className="w-full bg-gradient-to-r from-[var(--color-primary)] to-purple-600 hover:to-purple-500 disabled:opacity-50 disabled:grayscale text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-[var(--color-primary)]/25 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="animate-pulse">Creando billetera...</span>
                    ) : (
                        <>
                            Crear Billetera {selectedCurrency ? `en ${selectedCurrency}` : ''}
                            <Wallet className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
