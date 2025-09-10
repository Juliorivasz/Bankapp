
package com.bankapp.repository;

import com.bankapp.model.PerfilUsuario;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface PerfilUsuarioRepository extends ReactiveCrudRepository<PerfilUsuario, Long> {
    Mono<PerfilUsuario> findByIdUsuario(Long idUsuario);
}