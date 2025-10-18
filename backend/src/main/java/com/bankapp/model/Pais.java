package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("pais")
public class Pais {
    @Id
    private Long idPais;
    private String nombrePais;
    private String codigoIso;
}