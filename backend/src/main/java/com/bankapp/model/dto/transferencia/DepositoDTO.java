package com.bankapp.model.dto.transferencia;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositoDTO {
        private String numeroCuenta;
        private BigDecimal monto;
}
