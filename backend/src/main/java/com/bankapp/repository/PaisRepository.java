package com.bankapp.repository;
import com.bankapp.model.Pais;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface PaisRepository extends ReactiveCrudRepository<Pais, Long> {
    Mono<Pais> findByNombrePais(String nombrePais);
}