package com.bankapp.model.dto.perfil;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilDTO {
    
    // Datos del Usuario
    private String nombreUsuario;
    private String email;
    private LocalDateTime fechaCreacion;
    private String estadoCuenta;
    
    // Datos del Perfil
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String numeroTelefono;
}
