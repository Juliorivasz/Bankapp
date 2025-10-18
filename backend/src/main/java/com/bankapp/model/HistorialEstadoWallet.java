package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Table("historial_estado_wallet")
public class HistorialEstadoWallet {

    @Id
    private Long idHistorial;
    private Long idWallet;
    private String estadoAnterior;
    private String estadoNuevo;
    private LocalDateTime fechaCambio;
    private Long idAdministrador;
}