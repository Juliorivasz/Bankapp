package com.bankapp.model;

import com.bankapp.model.Enum.TipoNotificacion;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Table("notificacion")
public class Notificacion {

    @Id
    private Long idNotificacion;
    private Long idUsuario;
    private String titulo;
    private String mensaje;
    private TipoNotificacion tipo;
    private Boolean leida;
    private Boolean eliminada;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaLectura;
}
