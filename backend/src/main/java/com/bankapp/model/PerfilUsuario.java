package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDate;

@Data
@Table("perfil_usuario")
public class PerfilUsuario {

    @Id
    private Long idPerfil;
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String numeroTelefono;
}