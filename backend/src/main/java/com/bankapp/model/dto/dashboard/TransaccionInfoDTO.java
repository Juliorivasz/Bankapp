package com.bankapp.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransaccionInfoDTO {
  private Long idTransaccion;
  private String fecha; // LocalDateTime o String formateado
  private String descripcion;
  private BigDecimal monto;
  private String tipo; // DEPOSITO, RETIRO, TRANSFERENCIA
  private BigDecimal balanceAcumulado;
  private String estado;
  private String numeroCuenta; // Para vincular con la Wallet
}
