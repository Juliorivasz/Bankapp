package com.bankapp.model;

import com.bankapp.model.Enum.EstadoCuenta;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Table("usuario")
public class Usuario {

    @Id
    private Long idUsuario;
    private String nombreUsuario;
    private String email;
    private String password;
    private Long idRol;
    private String estadoCuenta;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaBaja;
}
