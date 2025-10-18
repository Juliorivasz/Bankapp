package com.bankapp.repository;

import com.bankapp.model.TipoMoneda;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface TipoMonedaRepository extends ReactiveCrudRepository<TipoMoneda, Long> {
    Mono<TipoMoneda> findBySimboloMoneda(String simbolo);
}