package com.bankapp.model.dto.tipoMoneda;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO utilizado por el Administrador para crear nuevos tipos de monedas en la plataforma.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoMonedaDTO {

    private String nombreMoneda;
    private String simboloMoneda;
}