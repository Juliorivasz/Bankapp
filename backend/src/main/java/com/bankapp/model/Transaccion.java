package com.bankapp.model;

import com.bankapp.model.Enum.EstadoTransaccion;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Table("transaccion")
public class Transaccion {

    @Id
    private Long idTransaccion;
    private Long idWallet;
    private BigDecimal monto;
    private EstadoTransaccion estadoTransaccion;
    private LocalDateTime fechaTransaccion;
    private String descripcion;
}
