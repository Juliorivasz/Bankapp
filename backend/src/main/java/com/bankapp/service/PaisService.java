package com.bankapp.service;

import com.bankapp.model.Pais;
import com.bankapp.repository.PaisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class PaisService {

    private final PaisRepository paisRepository;

    /**
     * Devuelve todos los países disponibles en la base de datos.
     * @return Flux<Pais> con la lista de países.
     */
    public Flux<Pais> obtenerTodosLosPaises() {
        return paisRepository.findAll();
    }
}