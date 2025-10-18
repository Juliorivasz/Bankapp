package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Data
@Table("log_auditoria")
public class LogAuditoria {

    @Id
    private Long idLog;
    private Long idAdministrador;
    private String accion;
    private String detalle;
    private Long idUsuarioAfectado;
    private LocalDateTime fechaAccion;
}