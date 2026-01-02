package com.bankapp.repository;

import com.bankapp.model.Notificacion;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface NotificacionRepository extends ReactiveCrudRepository<Notificacion, Long> {
    
    Flux<Notificacion> findByIdUsuarioAndEliminadaFalseOrderByFechaCreacionDesc(Long idUsuario);
    
    Flux<Notificacion> findByIdUsuarioAndLeidaFalseAndEliminadaFalseOrderByFechaCreacionDesc(Long idUsuario);
    
    Mono<Long> countByIdUsuarioAndLeidaFalseAndEliminadaFalse(Long idUsuario);
}
