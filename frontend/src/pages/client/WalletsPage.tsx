import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, Plus, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { walletService } from '../../service/wallet.service';
import type { Wallet } from '../../types/client/dashboard.types';
import { formatCurrency } from '../../utils/coinFormat';
import { AccountDetailsModal } from '../../components/client/AccountDetailsModal';
import { AddWalletModal } from '../../components/client/AddWalletModal';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const data = await walletService.getWallets();
      const uiWallets = data.map(walletService.mapToWalletUI);
      setWallets(uiWallets);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar tus wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("CBU copiado al portapapeles");
  };

  const openDetails = (wallet: Wallet) => {
      setSelectedWallet(wallet);
      setShowDetailsModal(true);
  };

  return (
    <div className="min-h-full bg-[var(--color-background)] text-white p-4 sm:p-6 lg:p-8 pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)]/20 rounded-lg">
                    <WalletIcon className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                Mis Billeteras
            </h1>
            <p className="text-white/60 ml-14 mt-1">
                Gestiona tus cuentas en diferentes monedas
            </p>
        </motion.div>

        <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-[var(--color-primary)]/25 transition-all"
        >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Nueva Wallet
        </motion.button>
      </div>

      {/* GRID DE WALLETS */}
      {loading && wallets.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                  <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl"></div>
              ))}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
              {wallets.map((wallet, index) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    layoutId={wallet.id}
                    className="relative group overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-[var(--color-primary)]/50 rounded-2xl p-6 transition-all hover:bg-white/[0.07]"
                  >
                      {/* Fondo decorativo */}
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-colors"></div>

                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-3">
                                  <span className="text-4xl filter drop-shadow-lg">{wallet.flag}</span>
                                  <div>
                                      <h3 className="font-bold text-lg">{wallet.currency}</h3>
                                      <p className="text-xs text-white/50">{wallet.code}</p>
                                  </div>
                              </div>
                              <button onClick={() => openDetails(wallet)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
                                  <ChevronRight className="w-5 h-5" />
                              </button>
                          </div>

                          <div className="mb-6">
                              <p className="text-sm text-white/60 mb-1">Balance Total</p>
                              <p className="text-3xl font-bold tracking-tight">
                                  {formatCurrency(wallet.balance, wallet.code)}
                              </p>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                              <div className="flex items-center gap-2 group/cbu cursor-pointer" onClick={() => handleCopy(wallet.accountNumber)}>
                                  <span className="font-mono text-xs text-white/40 group-hover/cbu:text-white transition-colors truncate max-w-[150px]">
                                      {wallet.accountNumber}
                                  </span>
                                  <Copy className="w-3 h-3 text-white/20 group-hover/cbu:text-[var(--color-primary)]" />
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20`}>
                                  Activa
                              </span>
                          </div>
                      </div>
                  </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Empty State si no hay wallets */}
            {!loading && wallets.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                    <p className="text-white/40 mb-4">No tienes ninguna wallet activa</p>
                    <button onClick={() => setShowAddModal(true)} className="text-[var(--color-primary)] font-bold hover:underline">
                        Crear mi primera wallet
                    </button>
                </div>
            )}
          </div>
      )}

      {/* MODALES */}
      {selectedWallet && (
          <AccountDetailsModal
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              wallet={selectedWallet}
          />
      )}

      <AddWalletModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchWallets}
          existingWallets={wallets}
      />

    </div>
  );
}
