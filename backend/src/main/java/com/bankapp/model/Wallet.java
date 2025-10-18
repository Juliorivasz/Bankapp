package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Table("wallet")
public class Wallet {

    @Id
    private Long idWallet;
    private Long idUsuario;
    private Long idMoneda;
    private String numeroCuenta;
    private BigDecimal balance;
    private LocalDateTime fechaCreacion;
    private LocalDateTime ultimaActualizacion;
    private String estadoWallet;
}
