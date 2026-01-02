package com.bankapp.service;

import com.bankapp.model.Enum.TipoNotificacion;
import com.bankapp.model.Notificacion;
import com.bankapp.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    /**
     * Crea una nueva notificación para un usuario.
     */
    @Transactional
    public Mono<Notificacion> crearNotificacion(Long idUsuario, String titulo, String mensaje, TipoNotificacion tipo) {
        Notificacion notificacion = new Notificacion();
        notificacion.setIdUsuario(idUsuario);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setTipo(tipo);
        notificacion.setLeida(false);
        notificacion.setEliminada(false); // Iniciar como no eliminada
        notificacion.setFechaCreacion(LocalDateTime.now());
        
        return notificacionRepository.save(notificacion);
    }

    /**
     * Obtiene todas las notificaciones no eliminadas de un usuario.
     */
    public Flux<Notificacion> obtenerNotificaciones(Long idUsuario) {
        return notificacionRepository.findByIdUsuarioAndEliminadaFalseOrderByFechaCreacionDesc(idUsuario);
    }

    /**
     * Obtiene solo las notificaciones no leídas y no eliminadas de un usuario.
     */
    public Flux<Notificacion> obtenerNoLeidas(Long idUsuario) {
        return notificacionRepository.findByIdUsuarioAndLeidaFalseAndEliminadaFalseOrderByFechaCreacionDesc(idUsuario);
    }

    /**
     * Cuenta las notificaciones no leídas y no eliminadas de un usuario.
     */
    public Mono<Long> contarNoLeidas(Long idUsuario) {
        return notificacionRepository.countByIdUsuarioAndLeidaFalseAndEliminadaFalse(idUsuario);
    }

    /**
     * Marca una notificación como leída.
     */
    @Transactional
    public Mono<Notificacion> marcarComoLeida(Long idNotificacion) {
        return notificacionRepository.findById(idNotificacion)
                .switchIfEmpty(Mono.error(new RuntimeException("Notificación no encontrada")))
                .flatMap(notificacion -> {
                    notificacion.setLeida(true);
                    notificacion.setFechaLectura(LocalDateTime.now());
                    return notificacionRepository.save(notificacion);
                });
    }

    /**
     * Elimina lógicamente una notificación.
     */
    @Transactional
    public Mono<Void> eliminarNotificacion(Long idNotificacion) {
        return notificacionRepository.findById(idNotificacion)
                .switchIfEmpty(Mono.error(new RuntimeException("Notificación no encontrada")))
                .flatMap(notificacion -> {
                    notificacion.setEliminada(true); // Borrado lógico
                    return notificacionRepository.save(notificacion);
                })
                .then();
    }

    /**
     * Marca todas las notificaciones activas de un usuario como leídas.
     */
    @Transactional
    public Mono<Void> marcarTodasComoLeidas(Long idUsuario) {
        return notificacionRepository.findByIdUsuarioAndLeidaFalseAndEliminadaFalseOrderByFechaCreacionDesc(idUsuario)
                .flatMap(notificacion -> {
                    notificacion.setLeida(true);
                    notificacion.setFechaLectura(LocalDateTime.now());
                    return notificacionRepository.save(notificacion);
                })
                .then();
    }
}
