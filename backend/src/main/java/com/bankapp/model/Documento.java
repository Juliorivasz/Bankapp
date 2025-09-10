package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Table("documento")
public class Documento {

    @Id
    private Long idDocumento;
    private Long idPerfil;
    private String tipoDocumento;
    private String numeroDocumento;
    private LocalDate fechaExpiracion;
    private String estadoVerificacion;
    private LocalDateTime fechaSubida;
}