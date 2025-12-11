package com.bankapp.model.dto.transferencia;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinatarioDTO {
    private Long idUsuario;
    private String nombreCompleto;
    private String alias; // username
    private String cbu; // numeroCuenta (si se buscó por cbu)
    private String banco; // "BankApp"
}
