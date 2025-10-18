package com.bankapp.model.dto.reporte;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BalanceGlobalDTO {

    // Asume que la ID de la moneda es suficiente para el reporte
    private Long idMoneda;

    // El balance total de todas las wallets que usan esta moneda
    private BigDecimal saldoTotal;
}