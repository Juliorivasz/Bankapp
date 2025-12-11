package com.bankapp.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletInfoDTO {
  private Long idWallet;
  private String numeroCuenta;
  private BigDecimal balance;
  private String monedaNombre;
  private String monedaSimbolo;
  private String estado;
}
