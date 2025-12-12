import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Plus, ChevronRight, Copy, ArrowRightLeft } from 'lucide-react';
import { walletService } from '../../service/wallet.service';
import { toast } from 'react-toastify';
import { AddWalletModal } from '../../components/client/AddWalletModal';
import { AccountDetailsModal } from '../../components/client/AccountDetailsModal';
import { ExchangeModal } from '../../components/client/ExchangeModal';
import { getFlag } from '../../utils/currencyUtils';

import { Loader } from '../../components/ui/Loader';
import type { Wallet } from '../../types/client/dashboard.types'; // Import shared type

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]); // Use shared type
  const [loading, setLoading] = useState(true);

  // Modales
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await walletService.getWallets();
      // Map WalletInfoDTO to shared Wallet interface
      const mappedWallets: Wallet[] = data.map(w => ({
        id: w.idWallet.toString(),
        accountNumber: w.numeroCuenta,
        balance: w.balance,
        status: w.estado,
        currency: w.monedaNombre, // Map to 'currency'
        code: w.monedaSimbolo,    // Map to 'code'
        primaryValue: w.balance,  // Assuming 1:1 for display or recalculate if needed
        flag: getFlag(w.monedaSimbolo) // Calculate flag
      }));
      setWallets(mappedWallets);
    } catch (error) {
// ...
      console.error("Error fetching wallets:", error);
      toast.error('Error al cargar las billeteras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success('¡CBU copiado!');
  };

  const openDetails = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowDetailsModal(true);
  };


  if (loading) {
    return <Loader text="Cargando tus billeteras..." />;
  }

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

        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
        >


            <button
                onClick={() => setShowAddModal(true)}
                className="group flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-[var(--color-primary)]/25 transition-all"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Nueva Wallet
            </button>
        </motion.div>
      </div>

      {/* GRID DE WALLETS */}
      {wallets.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
        >
            <WalletIcon className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No tienes billeteras activas</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
                Comienza creando tu primera billetera digital para gestionar tus fondos de manera segura.
            </p>
            <button
                onClick={() => setShowAddModal(true)}
                className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--color-primary)]/90 transition-colors"
            >
                Crear mi primera Wallet
            </button>
        </motion.div>
      ) : (
        <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn"
        >
            {wallets.map((wallet) => (
                <div
                    key={wallet.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 hover:to-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                         {/* Fondo decorativo */}
                         <div className="absolute -right-10 -top-10 w-40 h-40 bg-[var(--color-primary)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/20 transition-all duration-500" />
                         
                        <div className="p-6 relative z-10 flex flex-col h-full justify-between gap-6">
                            
                            {/* Cabecera Wallet */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{wallet.flag}</span>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-[var(--color-primary)] transition-colors">
                                            {wallet.currency}
                                        </h3>
                                        <div className="flex items-center gap-2 text-white/50 text-xs font-mono bg-black/20 px-2 py-1 rounded cursor-pointer hover:bg-black/40 transition-colors"
                                             onClick={(e) => handleCopy(e, wallet.accountNumber)}
                                             title="Copiar CBU"
                                        >
                                            {wallet.accountNumber}
                                            <Copy className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${wallet.status === 'ACTIVA' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                            </div>

                            {/* Balance */}
                            <div>
                                <p className="text-white/60 text-sm mb-1">Saldo Disponible</p>
                                <p className="text-3xl font-bold text-white tracking-tight">
                                    {wallet.code} {wallet.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Acciones */}
                            <div className="pt-4 border-t border-white/10 flex gap-2">
                                <button 
                                    onClick={() => {
                                        setSelectedWallet(wallet);
                                        setShowExchangeModal(true);
                                    }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group/btn"
                                >
                                    <ArrowRightLeft className="w-4 h-4 text-white/50 group-hover/btn:rotate-180 transition-transform duration-500" />
                                    Convertir
                                </button>
                                <button 
                                    onClick={() => openDetails(wallet)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group/btn"
                                >
                                    Ver Detalles
                                    <ChevronRight className="w-4 h-4 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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
      
      <ExchangeModal 
        isOpen={showExchangeModal}
        onClose={() => {
            setShowExchangeModal(false);
            setSelectedWallet(null);
        }}
        initialSourceWalletId={selectedWallet ? selectedWallet.id : undefined}
        wallets={wallets}
        onSuccess={fetchWallets}
      />

    </div>
  );
}
