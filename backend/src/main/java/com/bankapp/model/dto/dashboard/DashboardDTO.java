package com.bankapp.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
  private String nombreUsuario;
  private BigDecimal balanceTotal; // Suma simple por ahora
  private List<WalletInfoDTO> wallets;
  private List<TransaccionInfoDTO> transaccionesRecientes;
  private EstadisticasDTO estadisticas;
  private List<BalanceDiarioDTO> balanceDiario;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class EstadisticasDTO {
    private int totalTransacciones;
    private BigDecimal totalIngresos;
    private BigDecimal totalEgresos;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class BalanceDiarioDTO {
    private String fecha;
    private BigDecimal ingresos;
    private BigDecimal egresos;
  }
}
