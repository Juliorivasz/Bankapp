import type { TooltipProps } from "recharts";
import type { ChartData } from "../../types/client/dashboard.types";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatCurrency } from "../../utils/coinFormat";
import { es } from "date-fns/locale";
import { format } from "date-fns";

export const CustomChartTooltip: React.FC<TooltipProps<ValueType, NameType>> = (props) => {
  const { active, payload } = props as any;
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData; 
    const isSend = data.amount < 0;

    return (
      <div className="bg-[var(--color-card)]/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-4 text-sm">
        <p className="font-bold text-white mb-2">{format(new Date(data.fullDate), 'dd/MM - HH:mm', { locale: es })}</p>
        <p className={`font-semibold ${isSend ? 'text-red-400' : 'text-green-400'}`}>
          {isSend ? 'Enviado' : 'Recibido'}: {formatCurrency(Math.abs(data.amount), "ARS")}
        </p>
        <p className="text-white/80">De: {data.fromTo}</p>
        <p className="text-white/60 mt-1">Balance: {formatCurrency(data.balance, "ARS")}</p>
      </div>
    );
  }
  return null;
};