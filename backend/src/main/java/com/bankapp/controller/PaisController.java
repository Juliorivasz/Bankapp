package com.bankapp.controller;

import com.bankapp.model.Pais;
import com.bankapp.model.dto.tipoMoneda.TipoMonedaDTO;
import com.bankapp.service.PaisService;
import com.bankapp.service.TipoMonedaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/paises")
@RequiredArgsConstructor
public class PaisController {

    private final PaisService paisService;
    private final TipoMonedaService tipoMonedaService;

    /**
     * Ruta pública para obtener la lista de países para el combo box del registro.
     * Ruta: GET /api/paises/lista
     */
    @GetMapping("/")
    public Flux<Pais> listarPaisesParaRegistro() {
        // Devuelve el Flux de países para el frontend
        return paisService.obtenerTodosLosPaises();
    }

    /**
     * 2. Ruta pública para obtener la lista de monedas para crear wallets adicionales.
     * Ruta: GET /api/publico/monedas
     */
    @GetMapping("/monedas")
    public Flux<TipoMonedaDTO> listarMonedasDisponibles() {
        return tipoMonedaService.obtenerTodasLasMonedasDisponibles();
    }
}