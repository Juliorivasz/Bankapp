package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("direccion")
public class Direccion {

    @Id
    private Long idDireccion;
    private Long idPerfil;
    private String calle;
    private String ciudad;
    private String codigoPostal;
    private String pais;
    private Boolean esPrincipal;
}