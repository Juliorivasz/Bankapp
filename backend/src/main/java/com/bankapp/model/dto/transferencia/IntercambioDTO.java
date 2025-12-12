package com.bankapp.model.dto.transferencia;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class IntercambioDTO {
    private String numeroCuentaOrigen;
    private String numeroCuentaDestino;
    private BigDecimal montoOrigen;
    private BigDecimal tasaConversion; // Tasa enviada desde el frontend
}
