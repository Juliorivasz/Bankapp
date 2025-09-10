package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;

@Data
@Table("wallet")
public class Wallet {

    @Id
    private Long idWallet;
    private Long idUsuario;
    private Long idMoneda;
    private BigDecimal balance;
}
