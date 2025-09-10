package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("rol")
public class Rol {
    @Id
    private Long idRol;
    private String nombreRol;
}
