package com.bankapp.model.dto.usuario;

import lombok.Data;

@Data
public class RegistroRapidoDTO {
    private String nombreUsuario;
    private String email;
    private String password;
    private String pais;
}