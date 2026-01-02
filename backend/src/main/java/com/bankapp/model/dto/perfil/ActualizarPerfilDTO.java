package com.bankapp.model.dto.perfil;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarPerfilDTO {
    
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String numeroTelefono;
    private String email;
}
