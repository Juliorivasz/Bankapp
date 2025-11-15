package com.bankapp.model.dto.usuario;

import lombok.Data;
import lombok.NonNull;

@Data
public class EmailDTO {
    @NonNull
    private String email;
}