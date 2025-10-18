package com.bankapp.repository;

import com.bankapp.model.Soporte;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface SoporteRepository extends ReactiveCrudRepository<Soporte, Long> {
    Flux<Soporte> findByIdUsuario(Long idUsuario);
    Flux<Soporte> findByEstado(String estado);
}