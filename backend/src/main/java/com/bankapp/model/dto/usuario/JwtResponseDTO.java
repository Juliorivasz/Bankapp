package com.bankapp.model.dto.usuario;

import lombok.Data;

@Data
public class JwtResponseDTO {
    private String token;
    private String tipo = "Bearer";
}