package com.bankapp.repository;

import com.bankapp.model.Rol;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface RolRepository extends ReactiveCrudRepository<Rol, Long> {
    Mono<Rol> findByNombreRol(String nombreRol);
    Mono<Rol> findByIdRol(Long idRol);
}
