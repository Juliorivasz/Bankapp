import { format } from "date-fns";
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarIcon, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
// Se elimina la importación de CSS que causaba problemas: import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';
import {formatCurrency } from "../../utils/coinFormat"; 

import { subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  Bar,
  BarChart,
  Legend,
} from 'recharts';
import type { BalanceDiarioDTO } from "../../types/client/dashboard.types";

interface MovementsChartProps {
  data: BalanceDiarioDTO[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onRefresh?: () => void;
}

export const MovementsChart: React.FC<MovementsChartProps> = ({ data, dateRange, setDateRange }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);

  // Funciones para presets de fecha (aplican inmediatamente)
  const setLast7Days = () => setDateRange({ from: subDays(new Date(), 7), to: new Date() });
  const setLast30Days = () => setDateRange({ from: subDays(new Date(), 30), to: new Date() });
  const setThisMonth = () => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });

  const togglePicker = () => {
    if (!isPickerOpen) {
      // Al abrir, sincronizamos el temporal con el actual
      setTempDateRange(dateRange);
    }
    setIsPickerOpen(!isPickerOpen);
  };

  const handleApply = () => {
    setDateRange(tempDateRange);
    setIsPickerOpen(false);
  };

  const handleCancel = () => {
    setIsPickerOpen(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-card)] border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white font-bold mb-2">{format(new Date(label), 'dd LLLL yyyy', { locale: es })}</p>
          <div className="space-y-1">
            <p className="text-green-400 text-sm">
              Ingresos: <span className="font-semibold">{formatCurrency(payload[0].value, "ARS")}</span>
            </p>
            <p className="text-red-400 text-sm">
              Egresos: <span className="font-semibold">{formatCurrency(payload[1].value, "ARS")}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[var(--color-card)]/70 border border-white/10 rounded-2xl shadow-xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
             Ingresos vs Egresos
          </h3>
          <p className="text-sm text-white/60">Comparativa diaria de tus movimientos</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botones de Filtro Rápido */}
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
             <button onClick={setLast7Days} className="px-3 py-1 text-xs font-medium text-white/70 hover:bg-white/10 rounded-md transition-colors">7D</button>
             <button onClick={setLast30Days} className="px-3 py-1 text-xs font-medium text-white/70 hover:bg-white/10 rounded-md transition-colors">30D</button>
             <button onClick={setThisMonth} className="px-3 py-1 text-xs font-medium text-white/70 hover:bg-white/10 rounded-md transition-colors">Mes</button>
          </div>

          {/* Selector de Fechas */}
          <div className="relative">
            <button
              onClick={togglePicker}
              className="flex items-center gap-2 text-sm font-medium text-white/80 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg px-4 py-2 hover:bg-[var(--color-primary)]/20 transition-all shadow-sm"
            >
              <CalendarIcon className="w-4 h-4 text-[var(--color-primary)]" />
              <span>
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`
                  ) : (
                    format(dateRange.from, 'dd MMM', { locale: es })
                  )
                ) : "Seleccionar"}
              </span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>

            <AnimatePresence>
              {isPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 z-50 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-2"
                  style={{ minWidth: '300px' }}
                >
                  <DayPicker
                    mode="range"
                    defaultMonth={tempDateRange?.from || dateRange?.from || new Date()}
                    selected={tempDateRange}
                    onSelect={setTempDateRange}
                    numberOfMonths={1}
                    locale={es}
                    modifiersClassNames={{
                      selected: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]",
                      today: "text-[var(--color-primary)] font-bold"
                    }}
                    styles={{
                      caption: { color: 'white' },
                      head_cell: { color: '#9ca3af' },
                      day: { color: '#e5e7eb' },
                      nav_button: { color: 'white' }
                    }}
                  />
                  <div className="flex justify-end gap-2 p-2 border-t border-white/10 mt-2">
                    <button 
                      onClick={handleCancel}
                      className="px-3 py-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleApply}
                      className="px-3 py-1 text-xs font-medium text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary)]/80 transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="w-full h-[300px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="fecha" 
                stroke="#9ca3af" 
                fontSize={12} 
                tickFormatter={(val) => format(new Date(val), 'dd/MM')} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={11} 
                tickFormatter={(val) => `$${val}`} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                name="Ingresos" 
                dataKey="ingresos" 
                fill="#4ade80" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
              <Bar 
                name="Egresos" 
                dataKey="egresos" 
                fill="#f87171" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Filter className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No hay movimientos en este periodo</p>
            <p className="text-xs">Intenta seleccionar otro rango de fechas</p>
          </div>
        )}
      </div>
    </div>
  );
};
