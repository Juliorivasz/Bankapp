package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Table("soporte")
public class Soporte {

    @Id
    private Long idSolicitud;
    private Long idUsuario;
    private String asunto;
    private String mensaje;
    private String estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCierre;
}
