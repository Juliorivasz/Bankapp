import { useState } from "react";
import type { BalancePanelProps, Wallet } from "../../types/client/dashboard.types";
import { ChevronDown, Eye, EyeOff, Info } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';
import { formatCurrency } from "../../utils/coinFormat";
import { AccountDetailsModal } from "./AccountDetailsModal";
import { useClickOutside } from "../../hooks/useClickOutside";

export const BalancePanel: React.FC<BalancePanelProps> = ({ 
  wallets, 
  totalBalance, 
  isHidden, 
  onToggleVisibility,
  baseCurrency,
  onCurrencyChange,
  selectedWallet,
  onWalletChange
}) => {
  // Click Outside Logic
  const walletMenuRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  const currencyMenuRef = useClickOutside<HTMLDivElement>(() => setIsCurrencyOpen(false));

  const [isOpen, setIsOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Currency Selector State
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const CURRENCIES = ['USD', 'ARS', 'BRL', 'MXN', 'CLP', 'COP', 'PEN', 'EUR'];

  const handleSelectWallet = (wallet: Wallet) => {
    onWalletChange(wallet);
    setIsOpen(false);
  };

  return (
    <>
    <div className="bg-gradient-to-br from-blue-950/80 to-[var(--color-card)]/70 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-6 relative">
      
      {/* Selector de Wallet (Combobox) */}
      <div className="flex items-center gap-4">
          <div className="relative inline-block text-left" ref={walletMenuRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-lg font-medium text-white/80 hover:text-white transition-colors"
            >
              <span className="text-2xl">{selectedWallet?.flag || '💰'}</span>
              {selectedWallet?.currency || 'Wallet'} ({selectedWallet?.code || '---'})
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Wallets */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-72 bg-[var(--color-card)] backdrop-blur-xl border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  {wallets.map((wallet: Wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleSelectWallet(wallet)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 transition-colors"
                    >
                      <span className="text-2xl">{wallet.flag}</span>
                      <div className="text-left">
                        <span className="block font-medium">{wallet.code}</span>
                        <span className="block text-xs text-white/60">{wallet.currency}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón Info (Mis Datos) */}
          <button 
             onClick={() => setShowInfoModal(true)}
             className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
             title="Ver datos de cuenta"
          >
             <Info className="w-5 h-5" />
          </button>
      </div>

      {/* Botón de Ocultar Saldo */}
      <button 
        onClick={onToggleVisibility} 
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
      >
        {isHidden ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
      </button>

      {/* Saldo Principal */}
      <div className="mt-4">
        {isHidden ? (
          <h2 className="text-5xl font-bold text-white tracking-widest">••••••</h2>
        ) : (
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-bold text-white">
              {selectedWallet ? formatCurrency(selectedWallet.balance, selectedWallet.code) : '---'}
            </h2>
          </div>
        )}
      </div>

      {/* Saldo Total (Con Selector de Moneda Base) */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium text-white/60">
          Valor total aprox en:
        </span>
        
        {/* Selector de Moneda Base */}
        <div className="relative" ref={currencyMenuRef}>
            <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="bg-black/30 hover:bg-black/50 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2 transition-all shadow-sm"
            >
                {baseCurrency}
                <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isCurrencyOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute bottom-full mb-2 left-0 w-32 bg-[#0f172a] border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                    >
                        {CURRENCIES.map(curr => (
                            <button
                                key={curr}
                                onClick={() => {
                                    onCurrencyChange(curr);
                                    setIsCurrencyOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors flex justify-between items-center ${baseCurrency === curr ? 'text-[var(--color-primary)] font-bold bg-white/5' : 'text-white/80'}`}
                            >
                                {curr}
                                {baseCurrency === curr && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <span className="ml-auto text-lg font-semibold text-white/90">
          {isHidden ? "••••••••" : formatCurrency(totalBalance, baseCurrency)}
        </span>
      </div>
    </div>

    {/* MODAL DE DATOS DE CUENTA */}
    {selectedWallet && (
        <AccountDetailsModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
        wallet={selectedWallet} 
        />
    )}
    </>
  );
};
