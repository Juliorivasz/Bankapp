package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("pais_moneda")
public class PaisMoneda {
    @Id
    private Long idPaisMoneda;
    private Long idPais;
    private Long idMoneda;
    private Boolean esPrincipal;
}