package com.bankapp.service;

import com.bankapp.model.Soporte;
import com.bankapp.model.Usuario;
import com.bankapp.model.dto.soporte.NuevaSolicitudDTO;
import com.bankapp.repository.SoporteRepository;
import com.bankapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SoporteService {

    private final SoporteRepository soporteRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * HISTORIA DE USUARIO: Permite al cliente crear una nueva solicitud de soporte.
     * @param username El nombre de usuario (o email) del cliente.
     * @param dto Los datos de la solicitud.
     * @return Mono que emite la solicitud guardada.
     */
    public Mono<Soporte> crearSolicitud(String username, NuevaSolicitudDTO dto) {

        // 1. Obtener el ID del usuario
        return usuarioRepository.findByNombreUsuario(username)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario autenticado no encontrado para soporte.")))
                .flatMap(usuario -> {
                    Soporte solicitud = new Soporte();
                    solicitud.setIdUsuario(usuario.getIdUsuario());
                    solicitud.setAsunto(dto.getAsunto());
                    solicitud.setMensaje(dto.getMensaje());
                    solicitud.setEstado("ABIERTA"); // Estado inicial
                    solicitud.setFechaCreacion(LocalDateTime.now());

                    return soporteRepository.save(solicitud);
                });
    }

    /**
     * Permite al cliente ver su lista de solicitudes (solo las propias).
     */
    public Flux<Soporte> obtenerSolicitudesPorUsuario(Long idUsuario) {
        return soporteRepository.findByIdUsuario(idUsuario);
    }

    /**
     * HISTORIA DE USUARIO: Ver y gestionar las solicitudes (Admin).
     * Retorna todas las solicitudes, idealmente solo las ABIERTAS o EN PROCESO.
     */
    public Flux<Soporte> obtenerTodasLasSolicitudesAbiertas() {
        // Asumimos un metodo en el repo que filtra por estado "ABIERTA"
        return soporteRepository.findByEstado("ABIERTA");
    }

    /**
     * Permite al administrador cerrar una solicitud resuelta.
     */
    public Mono<Soporte> cerrarSolicitud(Long idSolicitud) {
        return soporteRepository.findById(idSolicitud)
                .switchIfEmpty(Mono.error(new RuntimeException("Solicitud de soporte no encontrada.")))
                .flatMap(solicitud -> {
                    solicitud.setEstado("CERRADA");
                    solicitud.setFechaCierre(LocalDateTime.now());
                    return soporteRepository.save(solicitud);
                });
    }
}