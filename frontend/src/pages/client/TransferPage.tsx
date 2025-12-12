import { useState, useEffect } from 'react';
import { ArrowLeft, Check, ChevronRight, User, AlertCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../service/apiClient';
import { toast } from 'react-toastify';
import type { DestinatarioDTO, WalletInfoDTO } from '../../types/client/dashboard.types';
import { formatCurrency } from '../../utils/coinFormat';
import { dashboardService } from '../../service/dashboard.service';
import { transferService } from '../../service/transfer.service';
import { AccountDetailsModal } from '../../components/client/AccountDetailsModal';
import type { Wallet } from '../../types/client/dashboard.types';
import { getFlag } from '../../utils/currencyUtils';
import { FormattedAmountInput } from '../../components/ui/FormattedAmountInput';

// Pasos del Wizard
const STEPS = ['Destinatario', 'Monto', 'Confirmación', 'Comprobante'];

export default function TransferPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estado del Formulario
  const [searchQuery, setSearchQuery] = useState('');
  const [destinatario, setDestinatario] = useState<DestinatarioDTO | null>(null);
  const [monto, setMonto] = useState('');
  const [motivo, setMotivo] = useState('');
  
  // Estado de Wallets
  const [wallets, setWallets] = useState<WalletInfoDTO[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfoDTO | null>(null);
  
  // Destinatarios Recientes
  const [recentRecipients, setRecentRecipients] = useState<DestinatarioDTO[]>([]);

  // Fetch Dashboard y Recientes
  // Fetch Dashboard y Recientes
  useEffect(() => {
      const fetchData = async () => {
          // 1. Cargar Wallets (Crítico)
          try {
              const dashboardData = await dashboardService.getDashboard();
              setWallets(dashboardData.wallets);
              
              // Seleccionar ARS por defecto o la primera
              const defaultWallet = dashboardData.wallets.find(w => w.monedaSimbolo === 'ARS') || dashboardData.wallets[0];
              if (defaultWallet) setSelectedWallet(defaultWallet);
          } catch (error) {
              console.error("Error cargando wallets", error);
              toast.error("No se pudieron cargar tus cuentas");
          }

          // 2. Cargar Recientes (Opcional - No bloqueante)
          try {
              const recentData = await transferService.getRecentRecipients();
              setRecentRecipients(recentData);
          } catch (error) {
              console.warn("No se pudieron cargar destinatarios recientes", error);
              // No mostramos error al usuario para no molestar, simplemente no hay recientes
          }
      };
      
      fetchData();
  }, []);

  const moneda = selectedWallet?.monedaSimbolo || 'ARS';

  // Estado para validación de saldo
  const [showDepositModal, setShowDepositModal] = useState(false);

  // --- PASO 1: BUSCAR DESTINATARIO ---
  const handleSearchDestinatario = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get<DestinatarioDTO>(`/cliente/destinatario/validar?dato=${searchQuery}&moneda=${moneda}`);
      setDestinatario(data);
      // toast.success("Destinatario encontrado"); // Feedback visual es suficiente con el cambio de paso
      nextStep();
    } catch (error) {
      console.error(error);
      toast.error(`No se encontró destinatario para ${moneda}`);
      setDestinatario(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecent = (recipient: DestinatarioDTO) => {
      setDestinatario(recipient);
      setSearchQuery(recipient.alias); // Para que se vea en el input si vuelve atrás (opcional)
      nextStep();
  };

  // --- PASO 3: CONFIRMAR TRANSFERENCIA ---
  const handleTransferir = async () => {
      if (!destinatario || !monto || !selectedWallet) return;
      setLoading(true);
      try {
          await apiClient.post('/cliente/transferir', {
              numeroCuentaOrigen: selectedWallet.numeroCuenta,
              destino: destinatario.alias,
              monto: parseFloat(monto),
              motivo: motivo
          });
          // SI TODO SALE BIEN
          nextStep(); // Ir a comprobante
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Error al realizar la transferencia");
      } finally {
          setLoading(false);
      }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  // Validación de saldo
  const saldoDisponible = selectedWallet?.balance || 0;
  const montoNum = parseFloat(monto || '0');
  const saldoInsuficiente = montoNum > saldoDisponible;

  // Wallet convertida para el Modal de Depósito
  const depositWallet: Wallet | null = selectedWallet ? {
      id: selectedWallet.idWallet.toString(),
      accountNumber: selectedWallet.numeroCuenta,
      currency: selectedWallet.monedaNombre,
      code: selectedWallet.monedaSimbolo,
      balance: selectedWallet.balance,
      primaryValue: selectedWallet.balance,
      flag: getFlag(selectedWallet.monedaSimbolo),
      status: selectedWallet.estado || 'activo'
  } : null;

  return (
    <>
    <div className="min-h-screen bg-[var(--color-background)] text-white p-4 sm:p-6 lg:p-8 flex justify-center">
      
      <div className="w-full max-w-2xl">
        
        {/* Header con botón Volver */}
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Nueva Transferencia</h1>
        </div>

        {/* Indicador de Pasos */}
        <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
            <div 
                className="absolute top-1/2 left-0 h-1 bg-[var(--color-primary)] -z-10 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>

            {STEPS.map((step, index) => (
                <div key={index} className={`flex flex-col items-center gap-2 ${index <= currentStep ? 'text-[var(--color-primary)]' : 'text-white/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                        index <= currentStep 
                        ? 'bg-[var(--color-background)] border-[var(--color-primary)]' 
                        : 'bg-[var(--color-background)] border-white/10'
                    }`}>
                        {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step}</span>
                </div>
            ))}
        </div>

        {/* CONTENIDO DEL WIZARD */}
        <div className="bg-[var(--color-card)]/70 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[400px]">
            
            {/* PASO 1: DESTINATARIO */}
            {currentStep === 0 && (
                <div className="animate-fadeIn space-y-6">
                    {/* Selector de Wallet */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60">Desde mi cuenta</label>
                        <select 
                            value={selectedWallet?.idWallet}
                            onChange={(e) => {
                                const wallet = wallets.find(w => w.idWallet.toString() === e.target.value);
                                if (wallet) setSelectedWallet(wallet);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                        >
                            {wallets.map(w => (
                                <option key={w.idWallet} value={w.idWallet} className="bg-[#0f172a]">
                                    {getFlag(w.monedaSimbolo)} {w.monedaNombre} - Saldo: {formatCurrency(w.balance, w.monedaSimbolo)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="h-px bg-white/5 w-full"></div>

                    <h2 className="text-xl font-bold">¿A quién quieres transferir?</h2>
                    
                    {/* Input Rediseñado */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-6 w-6 text-[var(--color-primary)] group-focus-within:text-white transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por alias, CBU o CVU"
                            className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white/10 transition-all"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchDestinatario()}
                        />
                        <button 
                            className="absolute inset-y-2 right-2 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                             onClick={handleSearchDestinatario}
                             disabled={!searchQuery || loading}
                        >
                            {loading ? '...' : <ChevronRight className="w-5 h-5"/>}
                        </button>
                    </div>



            {/* Destinatarios Recientes Agrupados */}
            {recentRecipients.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-sm text-white/50 mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" /> Recientes
                    </h3>
                    <div className="space-y-4">
                        <RecentRecipientsList recipients={recentRecipients} onSelect={handleSelectRecent} />
                    </div>
                </div>
            )}
        </div>
    )}

            {/* PASO 2: MONTO */}
            {currentStep === 1 && destinatario && (
                <div className="animate-fadeIn space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Transfiriendo a</p>
                            <p className="font-bold text-white">{destinatario.nombreCompleto}</p>
                            <p className="text-xs text-white/40">{destinatario.banco} • {destinatario.cbu}</p>
                            <input 
                                type="text"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Motivo (opcional)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none placeholder:text-white/20 mt-4" 
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold">¿Cuánto quieres enviar?</h2>
                    
                    <div className="relative">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[var(--color-primary)]">{selectedWallet?.monedaSimbolo === 'USD' ? 'US$' : '$'}</span>
                        <FormattedAmountInput 
                            value={monto}
                            onChange={(val) => setMonto(val)}
                            placeholder="0,00"
                            className={`w-full bg-white/5 border ${saldoInsuficiente ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-[var(--color-primary)]'} rounded-xl px-4 py-6 pl-18 text-3xl font-bold text-white focus:ring-2 focus:border-transparent transition-all placeholder:text-white/10`}
                            autoFocus
                        />
                    </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <p className={saldoInsuficiente ? 'text-red-400 font-bold' : 'text-white/50'}>
                           Disponible: {formatCurrency(saldoDisponible, selectedWallet?.monedaSimbolo || 'ARS')}
                           {saldoInsuficiente && <span className="ml-2 flex items-center gap-1 inline-flex"><AlertCircle className="w-4 h-4"/> Saldo insuficiente</span>}
                       </p>
                    </div>

                    {/* Botón de DEPOSITAR si no hay saldo */}
                    {saldoInsuficiente && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between animate-fadeIn">
                            <span className="text-red-200 text-sm">¿Necesitas fondos?</span>
                            <button 
                                onClick={() => setShowDepositModal(true)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                Depositar Dinero
                            </button>
                        </div>
                    )}
                    
                     <div className="flex justify-between pt-6">
                        <button onClick={prevStep} className="text-white/60 hover:text-white px-4 py-2">Atrás</button>
                        <button 
                            onClick={nextStep}
                            disabled={!monto || parseFloat(monto) <= 0 || saldoInsuficiente}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 disabled:opacity-50 disabled:grayscale text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                        >
                            Continuar
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 3: CONFIRMACIÓN */}
            {currentStep === 2 && destinatario && (
                <div className="animate-fadeIn space-y-6 text-center">
                    <h2 className="text-2xl font-bold mb-6">Revisa los datos</h2>
                    
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
                         <div>
                            <p className="text-sm text-white/50 mb-1">Vas a transferir</p>
                            <p className="text-4xl font-bold text-[var(--color-primary)]">{formatCurrency(parseFloat(monto), selectedWallet?.monedaSimbolo || 'ARS')}</p>
                         </div>
                         
                         <div className="h-px bg-white/10 w-full"></div>

                         <div className="grid gap-4 text-left">
                             <div className="flex justify-between">
                                 <span className="text-white/50">Para</span>
                                 <div className="text-right">
                                     <p className="font-bold">{destinatario.nombreCompleto}</p>
                                     <p className="text-xs text-white/50">{destinatario.cbu}</p>
                                     <p className="text-xs text-white/50">{destinatario.banco}</p>
                                 </div>
                             </div>
                              <div className="flex justify-between">
                                 <span className="text-white/50">Plazo</span>
                                 <span className="font-medium">Inmediato</span>
                             </div>
                         </div>
                    </div>

                    <div className="flex justify-between pt-6">
                         <button onClick={prevStep} className="text-white/60 hover:text-white px-4 py-2">Atrás</button>
                         <button 
                            onClick={handleTransferir}
                            disabled={loading}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 w-full sm:w-auto text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-[var(--color-primary)]/20"
                        >
                            {loading ? 'Procesando...' : 'Confirmar Transferencia'}
                        </button>
                    </div>
                </div>
            )}

             {/* PASO 4: COMPROBANTE - TODO */}
             {currentStep === 3 && (
                 <div className="text-center py-10 animate-fadeIn">
                     <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                         <Check className="w-10 h-10" />
                     </div>
                     <h2 className="text-3xl font-bold text-white mb-2">¡Transferencia Exitosa!</h2>
                     <p className="text-white/60 mb-8">El dinero ya está en camino.</p>
                     
                     <button onClick={() => navigate('/dashboard')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold">
                         Volver al inicio
                     </button>
                 </div>
             )}

        </div>
      </div>
    </div>
    
    {/* MODAL DE DEPOSITO (Reutilizando AccountDetailsModal) */}
    {depositWallet && (
        <AccountDetailsModal 
            isOpen={showDepositModal} 
            onClose={() => setShowDepositModal(false)} 
            wallet={depositWallet}
        />
    )}
    </>
  );
}

// ----------------------------------------------------
// Componentes Auxiliares (FUERA del componente principal)
// ----------------------------------------------------

// Componente para manejar el estado de acordeón de destinatarios recientes
function RecentRecipientsList({ recipients, onSelect }: { recipients: DestinatarioDTO[], onSelect: (d: DestinatarioDTO) => void }) {
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const grouped = Object.values(recipients.reduce((acc, curr) => {
        const key = curr.idUsuario?.toString() || curr.nombreCompleto;
        if (!acc[key]) {
            acc[key] = {
                id: key,
                user: curr,
                wallets: []
            };
        }
        if (!acc[key].wallets.some(w => w.cbu === curr.cbu)) {
            acc[key].wallets.push(curr);
        }
        return acc;
    }, {} as Record<string, { id: string, user: DestinatarioDTO, wallets: DestinatarioDTO[] }>));

    return (
        <>
            {grouped.map(({ id, user, wallets }) => (
                <div key={id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 transition-all">
                    
                    {/* Header del Usuario (Clickable) */}
                    <button 
                        onClick={() => setExpandedUser(expandedUser === id ? null : id)}
                        className="w-full p-4 flex items-center gap-3 border-b border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)]/30 to-purple-500/30 text-white font-bold flex items-center justify-center text-sm">
                            {user.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white">{user.nombreCompleto}</p>
                            <p className="text-xs text-white/40">{user.alias}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${expandedUser === id ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Lista de Wallets (Expandable) */}
                    {expandedUser === id && (
                        <div className="divide-y divide-white/5 bg-black/20 animate-fadeIn">
                            {wallets.map((wallet) => (
                                <button
                                    key={wallet.cbu}
                                    onClick={() => onSelect(wallet)}
                                    className="w-full flex items-center justify-between p-3 pl-16 hover:bg-white/10 transition-colors text-left group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getFlag(wallet.moneda)}</span>
                                            <span className="text-sm font-medium text-white group-hover:text-[var(--color-primary)] transition-colors">
                                                {wallet.moneda} • {wallet.banco}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/40 mt-0.5 font-mono tracking-wider">{wallet.cbu}</p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-white/60 border border-white/5 group-hover:border-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)] transition-colors">
                                        Seleccionar
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}
