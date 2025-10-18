package com.bankapp.model.dto.reporte;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReporteActividadDTO {

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Long totalUsuariosRegistrados;
    private Long totalTransaccionesExitosas;
    private BigDecimal volumenTotalTransacciones;
    private Long totalCuentasBloqueadas;
}