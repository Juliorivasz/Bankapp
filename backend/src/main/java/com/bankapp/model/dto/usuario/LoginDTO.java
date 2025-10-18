package com.bankapp.model.dto.usuario;

import lombok.Data;

@Data
public class LoginDTO {
    private String username;
    private String password;
}