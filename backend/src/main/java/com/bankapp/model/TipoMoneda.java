package com.bankapp.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("tipomoneda")
public class TipoMoneda {

    @Id
    private Long idMoneda;
    private String nombreMoneda;
    private String simboloMoneda;
}
