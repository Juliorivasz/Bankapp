import apiClient from './apiClient';
import type { WalletInfoDTO } from '../types/client/dashboard.types';
import type { Wallet } from '../types/client/dashboard.types';
import { getFlag } from '../utils/currencyUtils';

export const walletService = {
  getWallets: async (): Promise<WalletInfoDTO[]> => {
    // Modificamos para usar el endpoint de dashboard que YA trae la info completa (dto enriquecido).
    // El endpoint /cliente/wallets devuelve entidades crudas sin nombres de moneda.
    const { data } = await apiClient.get<any>('/cliente/dashboard');
    
    // data.wallets ya viene con el formato WalletInfoDTO
    return data.wallets;
  },

  createWallet: async (simboloMoneda: string): Promise<WalletInfoDTO> => {
    const { data } = await apiClient.post<any>('/cliente/wallet/nueva', { simboloMoneda });
    // Mapear respuesta
    return {
        idWallet: data.idWallet,
        numeroCuenta: data.numeroCuenta,
        balance: data.balance,
        monedaNombre: data.moneda?.nombre || 'Unknown',
        monedaSimbolo: data.moneda?.simbolo || simboloMoneda,
        estado: 'ACTIVO'
    };
  },
  
  // Helpers para UI
  mapToWalletUI: (dto: WalletInfoDTO): Wallet => {
      return {
          id: dto.idWallet.toString(),
          accountNumber: dto.numeroCuenta,
          currency: dto.monedaNombre,
          code: dto.monedaSimbolo,
          balance: dto.balance,
          primaryValue: dto.balance,
          flag: getFlag(dto.monedaSimbolo)
      };
  }
};
