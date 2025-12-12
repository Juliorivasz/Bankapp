import axios from 'axios';

// API pública gratuita para tasas de cambio (Base: USD)
const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

interface RatesResponse {
    base: string;
    date: string;
    rates: Record<string, number>;
}

export const exchangeService = {
    getRates: async (): Promise<Record<string, number>> => {
        try {
            const response = await axios.get<RatesResponse>(API_URL);
            return response.data.rates;
        } catch (error) {
            console.error("Error fetching exchange rates:", error);
            // Fallback rates if API fails (just safer to have something)
            return {
                USD: 1,
                ARS: 1200, // Aproximado
                EUR: 0.92,
                BRL: 5.0,
                MXN: 17.0,
                CLP: 950,
                COP: 3900,
                PEN: 3.7,
                BTC: 0.000015 // Very rough approx, focused on Fiat mostly as requested
            };
        }
    },

    /**
     * Convierte un monto de una moneda origen a una moneda destino.
     * Requiere pasar el objeto de tasas (rates) obtenido de getRates().
     * La API devuelve tasas con base en USD. 
     * Formula: (Monto / TasaOrigen) * TasaDestino
     * Ejemplo: 1000 ARS a BRL (Base USD: ARS=1000, BRL=5)
     * (1000 / 1000) * 5 = 5 BRL
     */
    convert: (amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number => {
        if (!rates) return amount;
        if (fromCurrency === toCurrency) return amount;

        const rateFrom = rates[fromCurrency] || 1; // Si no existe, asumimos 1:1 (evitar nan/infinity)
        const rateTo = rates[toCurrency] || 1;

        // Primero convertimos a USD (Base)
        const amountInUSD = amount / rateFrom;

        // Luego convertimos de USD a moneda destino
        return amountInUSD * rateTo;
    }
};
