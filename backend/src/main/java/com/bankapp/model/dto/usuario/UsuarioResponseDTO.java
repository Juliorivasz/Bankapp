package com.bankapp.model.dto.usuario;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UsuarioResponseDTO {
    private String nombreUsuario;
    private String email;
    private String estadoCuenta;
    private LocalDateTime fechaCreacion;
}
