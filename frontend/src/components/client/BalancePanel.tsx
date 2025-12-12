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

      {/* Saldo Total (Simplificado: Siempre en la moneda seleccionada) */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium text-white/50">
          Patrimonio Total Estimado ({selectedWallet?.code}):
        </span>
        
        <span className="ml-auto text-lg font-bold text-white/90 tracking-wide">
          {isHidden ? "••••••••" : formatCurrency(totalBalance, selectedWallet?.code || 'USD')}
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
