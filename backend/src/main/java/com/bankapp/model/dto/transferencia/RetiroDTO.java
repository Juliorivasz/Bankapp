package com.bankapp.model.dto.transferencia;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RetiroDTO {
    private String numeroCuenta;
    private BigDecimal monto;
}
