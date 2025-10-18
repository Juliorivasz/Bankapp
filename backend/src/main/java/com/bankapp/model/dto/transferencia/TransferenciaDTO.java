package com.bankapp.model.dto.transferencia;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferenciaDTO {
    private String numeroCuentaOrigen;
    private String destino;
    private BigDecimal monto;
}
