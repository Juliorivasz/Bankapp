import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      baseCurrency: 'USD', // Default to USD
      setBaseCurrency: (currency) => set({ baseCurrency: currency }),
    }),
    {
      name: 'currency-storage', // name of the item in the storage (must be unique)
    }
  )
);
