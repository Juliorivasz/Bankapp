package com.bankapp.model;

import com.bankapp.model.Enum.EstadoTransaccion;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Table("transaccion")
public class Transaccion {

    @Id
    @Transient
    private Long idTransaccion;
    private String numeroCuenta;
    private BigDecimal monto;
    private EstadoTransaccion estadoTransaccion;
    private LocalDateTime fechaTransaccion;
    private String descripcion;
}
