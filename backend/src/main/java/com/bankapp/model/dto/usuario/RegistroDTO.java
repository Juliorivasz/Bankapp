package com.bankapp.model.dto.usuario;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistroDTO {

    // Datos del Usuario
    private String nombreUsuario;
    private String email;
    private String password;

    // Datos del Perfil
    private String nombre;
    private String apellido;
    private LocalDate fechaNacimiento;
    private String numeroTelefono;

    // Datos del Documento
    private String tipoDocumento;
    private String numeroDocumento;
    private LocalDate fechaExpiracion;

    // Datos de la Dirección
    private String calle;
    private String ciudad;
    private String codigoPostal;
    private String pais;
}