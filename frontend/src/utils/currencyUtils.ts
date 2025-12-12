export const getFlag = (code: string): string => {
    switch (code?.toUpperCase()) {
        case 'ARS': return '🇦🇷'; // Peso Argentino
        case 'USD': return '🇺🇸'; // Dólar Estadounidense
        case 'EUR': return '🇪🇺'; // Euro
        case 'BRL': return '🇧🇷'; // Real Brasileño
        case 'BTC': return '₿';  // Bitcoin
        case 'ETH': return 'Ξ';  // Ethereum (Frontend only/Future)
        case 'MXN': return '🇲🇽'; // Peso Mexicano
        case 'CLP': return '🇨🇱'; // Peso Chileno
        case 'COP': return '🇨🇴'; // Peso Colombiano
        case 'PEN': return '🇵🇪'; // Sol Peruano
        case 'CAD': return '🇨🇦'; // Dólar Canadiense
        case 'JMD': return '🇯🇲'; // Dólar Jamaiquino
        case 'BOB': return '🇧🇴'; // Boliviano
        case 'GTQ': return '🇬🇹'; // Quetzal Guatemalteco
        case 'HNL': return '🇭🇳'; // Lempira Hondureña
        case 'PAB': return '🇵🇦'; // Balboa Panameño
        case 'TTD': return '🇹🇹'; // Dólar de Trinidad y Tobago
        case 'UYU': return '🇺🇾'; // Peso Uruguayo (Added for completeness)
        case 'PYG': return '🇵🇾'; // Guaraní Paraguayo
        case 'VES': return '🇻🇪'; // Bolívar Venezolano
        case 'CRC': return '🇨🇷'; // Colón Costarricense
        case 'DOP': return '🇩🇴'; // Peso Dominicano
        default: return '💰';
    }
};

export const getCurrencyName = (code: string): string => {
    switch (code?.toUpperCase()) {
        case 'ARS': return 'Peso Argentino';
        case 'USD': return 'Dólar Estadounidense';
        case 'EUR': return 'Euro';
        case 'BRL': return 'Real Brasileño';
        case 'BTC': return 'Bitcoin';
        case 'ETH': return 'Ethereum';
        case 'MXN': return 'Peso Mexicano';
        case 'CLP': return 'Peso Chileno';
        case 'COP': return 'Peso Colombiano';
        case 'PEN': return 'Sol Peruano';
        case 'CAD': return 'Dólar Canadiense';
        case 'JMD': return 'Dólar Jamaiquino';
        case 'BOB': return 'Boliviano';
        case 'GTQ': return 'Quetzal Guatemalteco';
        case 'HNL': return 'Lempira Hondureña';
        case 'PAB': return 'Balboa Panameño';
        case 'TTD': return 'Dólar de Trinidad y Tobago';
        // ... add others as needed
        default: return code;
    }
};
