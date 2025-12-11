import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction, TransactionsTableProps } from "../../types/client/dashboard.types";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "../../utils/coinFormat";
import { es } from "date-fns/locale";

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  return (
    <div className="bg-[var(--color-card)]/70 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Últimas Transacciones</h3>
      <div className="flow-root">
        {(!transactions || transactions.length === 0) ? (
           <div className="flex flex-col items-center justify-center py-10 text-white/50">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  {/* Si no tienes importado FileText, usa otro o agrega el import */}
                   <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-8 h-8 opacity-50"
                   >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                   </svg>
                </div>
                <p className="text-sm font-medium">No hay transacciones recientes</p>
                <p className="text-xs mt-1 text-white/40">Tus movimientos aparecerán aquí.</p>
            </div>
        ) : (
        <ul role="list" className="divide-y divide-white/10">
          {transactions.slice(0, 7).map((tx: Transaction) => (
            <li key={tx.id} className="py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                tx.type === 'send' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
              }`}>
                {tx.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{tx.name}</p>
                <p className="text-sm text-white/60 truncate">
                  {format(parseISO(tx.date), 'dd LLL, yyyy - hh:mm a', { locale: es })}
                </p>
              </div>
              <div className={`text-sm font-semibold text-right ${
                tx.type === 'send' ? 'text-red-400' : 'text-green-400'
              }`}>
                {tx.type === 'send' ? '-' : '+'} {formatCurrency(Math.abs(tx.amount), tx.currency)}
                <p className="text-xs font-normal text-white/60">{tx.currency}</p>
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
};