package com.bankapp.service;

import com.bankapp.model.TipoMoneda;
import com.bankapp.model.dto.tipoMoneda.TipoMonedaDTO;
import com.bankapp.repository.TipoMonedaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class TipoMonedaService {

    private final TipoMonedaRepository tipoMonedaRepository;

    /**
     * Obtiene todos los tipos de moneda disponibles y los mapea a un DTO público.
     * @return Flux de MonedaDTO.
     */
    public Flux<TipoMonedaDTO> obtenerTodasLasMonedasDisponibles() {
        return tipoMonedaRepository.findAll()
                .map(this::mapToMonedaDTO);

        // NOTA: Podrías filtrar aquí para excluir BTC si solo quieres monedas FIAT
    }

    // Metodo privado para mapear la entidad a un DTO público
    private TipoMonedaDTO mapToMonedaDTO(TipoMoneda tipoMoneda) {
        return new TipoMonedaDTO(tipoMoneda.getNombreMoneda(), tipoMoneda.getSimboloMoneda());
    }
}