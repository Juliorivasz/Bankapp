package com.bankapp.service;

import com.bankapp.model.dto.perfil.ActualizarPerfilDTO;
import com.bankapp.model.dto.perfil.CambiarPasswordDTO;
import com.bankapp.model.dto.perfil.PerfilDTO;
import com.bankapp.repository.PerfilUsuarioRepository;
import com.bankapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilUsuarioRepository perfilUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificacionService notificacionService;

    /**
     * Obtiene el perfil completo del usuario autenticado.
     * @param nombreUsuario Nombre de usuario del usuario autenticado
     * @return Mono<PerfilDTO> con los datos del perfil
     */
    public Mono<PerfilDTO> obtenerPerfil(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(usuario -> 
                    perfilUsuarioRepository.findByIdUsuario(usuario.getIdUsuario())
                        .switchIfEmpty(Mono.error(new RuntimeException("Perfil no encontrado")))
                        .map(perfil -> new PerfilDTO(
                            usuario.getNombreUsuario(),
                            usuario.getEmail(),
                            usuario.getFechaCreacion(),
                            usuario.getEstadoCuenta(),
                            perfil.getNombre(),
                            perfil.getApellido(),
                            perfil.getFechaNacimiento(),
                            perfil.getNumeroTelefono()
                        ))
                );
    }

    /**
     * Actualiza la información personal del usuario.
     * @param nombreUsuario Nombre de usuario del usuario autenticado
     * @param dto Datos a actualizar
     * @return Mono<PerfilDTO> con los datos actualizados
     */
    @Transactional
    public Mono<PerfilDTO> actualizarPerfil(String nombreUsuario, ActualizarPerfilDTO dto) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(usuario -> {
                    // Actualizar email si cambió
                    if (dto.getEmail() != null && !dto.getEmail().equals(usuario.getEmail())) {
                        // Verificar que el nuevo email no esté en uso
                        return usuarioRepository.findByEmail(dto.getEmail())
                                .hasElement()
                                .flatMap(existe -> {
                                    if (existe) {
                                        return Mono.error(new IllegalArgumentException("El email ya está en uso"));
                                    }
                                    usuario.setEmail(dto.getEmail());
                                    return usuarioRepository.save(usuario);
                                })
                                .then(Mono.just(usuario));
                    }
                    return Mono.just(usuario);
                })
                .flatMap(usuario -> 
                    perfilUsuarioRepository.findByIdUsuario(usuario.getIdUsuario())
                        .switchIfEmpty(Mono.error(new RuntimeException("Perfil no encontrado")))
                        .flatMap(perfil -> {
                            // Actualizar datos del perfil
                            if (dto.getNombre() != null) perfil.setNombre(dto.getNombre());
                            if (dto.getApellido() != null) perfil.setApellido(dto.getApellido());
                            if (dto.getFechaNacimiento() != null) perfil.setFechaNacimiento(dto.getFechaNacimiento());
                            if (dto.getNumeroTelefono() != null) perfil.setNumeroTelefono(dto.getNumeroTelefono());
                            
                            return perfilUsuarioRepository.save(perfil)
                                    .map(perfilActualizado -> new PerfilDTO(
                                        usuario.getNombreUsuario(),
                                        usuario.getEmail(),
                                        usuario.getFechaCreacion(),
                                        usuario.getEstadoCuenta(),
                                        perfilActualizado.getNombre(),
                                        perfilActualizado.getApellido(),
                                        perfilActualizado.getFechaNacimiento(),
                                        perfilActualizado.getNumeroTelefono()
                                    ));
                        })
                );
    }

    /**
     * Cambia la contraseña del usuario.
     * @param nombreUsuario Nombre de usuario del usuario autenticado
     * @param dto Datos para el cambio de contraseña
     * @return Mono<Void>
     */
    @Transactional
    public Mono<Void> cambiarPassword(String nombreUsuario, CambiarPasswordDTO dto) {
        // Validar que las contraseñas nuevas coincidan
        if (!dto.getPasswordNueva().equals(dto.getPasswordNuevaConfirmacion())) {
            return Mono.error(new IllegalArgumentException("Las contraseñas nuevas no coinciden"));
        }

        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(usuario -> {
                    // Verificar que la contraseña actual sea correcta
                    if (!passwordEncoder.matches(dto.getPasswordActual(), usuario.getPassword())) {
                        return Mono.error(new IllegalArgumentException("La contraseña actual es incorrecta"));
                    }

                    // Actualizar la contraseña
                    usuario.setPassword(passwordEncoder.encode(dto.getPasswordNueva()));
                    return usuarioRepository.save(usuario)
                        .flatMap(savedUsuario -> 
                            // Crear notificación de cambio de contraseña
                            notificacionService.crearNotificacion(
                                savedUsuario.getIdUsuario(),
                                "Contraseña Cambiada",
                                "Tu contraseña ha sido cambiada exitosamente. Si no fuiste tú, contacta a soporte inmediatamente.",
                                com.bankapp.model.Enum.TipoNotificacion.WARNING
                            ).then()
                        );
                })
                .then();
    }

    /**
     * Verifica si el perfil del usuario está completo (sin datos "PENDIENTE").
     * @param idUsuario ID del usuario
     * @return Mono<Boolean> true si está completo, false si tiene datos pendientes
     */
    public Mono<Boolean> verificarPerfilCompleto(Long idUsuario) {
        return perfilUsuarioRepository.findByIdUsuario(idUsuario)
                .map(perfil -> {
                    // Verificar si algún campo tiene "PENDIENTE"
                    boolean tienePendientes = "PENDIENTE".equals(perfil.getNombre()) ||
                                            "PENDIENTE".equals(perfil.getApellido()) ||
                                            "PENDIENTE".equals(perfil.getNumeroTelefono());
                    return !tienePendientes; // Retorna true si NO tiene pendientes
                })
                .defaultIfEmpty(false); // Si no existe perfil, retorna false
    }

    /**
     * Completa el perfil pendiente y actualiza el estado de la cuenta a ACTIVA.
     * @param nombreUsuario Nombre de usuario
     * @param dto Datos para completar el perfil
     * @return Mono<PerfilDTO> con los datos actualizados
     */
    @Transactional
    public Mono<PerfilDTO> completarPerfilPendiente(String nombreUsuario, ActualizarPerfilDTO dto) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(usuario -> {
                    // Actualizar email si cambió
                    if (dto.getEmail() != null && !dto.getEmail().equals(usuario.getEmail())) {
                        return usuarioRepository.findByEmail(dto.getEmail())
                                .hasElement()
                                .flatMap(existe -> {
                                    if (existe) {
                                        return Mono.error(new IllegalArgumentException("El email ya está en uso"));
                                    }
                                    usuario.setEmail(dto.getEmail());
                                    return usuarioRepository.save(usuario);
                                })
                                .then(Mono.just(usuario));
                    }
                    return Mono.just(usuario);
                })
                .flatMap(usuario ->
                    perfilUsuarioRepository.findByIdUsuario(usuario.getIdUsuario())
                        .switchIfEmpty(Mono.error(new RuntimeException("Perfil no encontrado")))
                        .flatMap(perfil -> {
                            // Actualizar todos los datos del perfil
                            perfil.setNombre(dto.getNombre());
                            perfil.setApellido(dto.getApellido());
                            perfil.setFechaNacimiento(dto.getFechaNacimiento());
                            perfil.setNumeroTelefono(dto.getNumeroTelefono());
                            
                            return perfilUsuarioRepository.save(perfil)
                                    .map(perfilActualizado -> new PerfilDTO(
                                        usuario.getNombreUsuario(),
                                        usuario.getEmail(),
                                        usuario.getFechaCreacion(),
                                        usuario.getEstadoCuenta(),
                                        perfilActualizado.getNombre(),
                                        perfilActualizado.getApellido(),
                                        perfilActualizado.getFechaNacimiento(),
                                        perfilActualizado.getNumeroTelefono()
                                    ))
                                    .flatMap(perfilDTO -> 
                                        // Crear notificación de perfil completado
                                        notificacionService.crearNotificacion(
                                            usuario.getIdUsuario(),
                                            "¡Bienvenido a BankApp!",
                                            "Tu perfil ha sido completado exitosamente. Ya puedes acceder a todas las funcionalidades.",
                                            com.bankapp.model.Enum.TipoNotificacion.SUCCESS
                                        ).thenReturn(perfilDTO)
                                    );
                        })
                );
    }
}
