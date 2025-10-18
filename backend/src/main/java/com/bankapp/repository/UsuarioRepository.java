package com.bankapp.repository;

import com.bankapp.model.Usuario;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UsuarioRepository extends ReactiveCrudRepository<Usuario, Long> {

    Mono<Usuario> findByEmail(String email);

    Mono<Usuario> findByNombreUsuario(String nombreUsuario);

    Mono<Long> countByEstadoCuenta(String estado);

}
