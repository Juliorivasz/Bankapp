package com.bankapp.controller;

import com.bankapp.config.security.JwtUtil;
import com.bankapp.model.dto.usuario.*;
import com.bankapp.service.UsuarioService;
import com.bankapp.service.SecurityUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final SecurityUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final com.bankapp.service.PerfilService perfilService; // Injected manually or via constructor lombok
    private final JwtUtil jwtUtil;

    /**
     * Endpoint público para la verificación de cuenta por email.
     * Ruta: GET /api/auth/verificar?token=[JWT]
     */
    @GetMapping("/verificar")
    public Mono<String> verificarCuenta(@RequestParam String token) {

        return usuarioService.verificarToken(token)
                .thenReturn("Cuenta verificada exitosamente. Ahora puedes iniciar sesión.");
    }

    /**
     * Endpoint público para solicitar un nuevo link de verificación.
     * Ruta: POST /api/auth/reenviar-verificacion
     */
    @PostMapping("/reenviar/verificacion")
    @ResponseStatus(HttpStatus.OK)
    public Mono<String> reenviarVerificacion(@RequestBody EmailDTO emailDTO) {

        return usuarioService.reenviarTokenVerificacion(emailDTO.getEmail())
                .thenReturn("Un nuevo enlace de verificación ha sido enviado a " + emailDTO.getEmail());
    }

    /**
     * Endpoint público para la verificación de usuario.
     * Ruta: GET /api/auth/usuario/validar?usuario=
     */
    @GetMapping("/validar/usuario")
    @ResponseStatus(HttpStatus.OK)
    public Mono<String> validarUsuario(@RequestParam("usuario") String usuario) {

        return usuarioService.validarUsuarioNoExiste(usuario)
                .thenReturn("Nombre de usuario disponible.");
    }

    /**
     * HISTORIA DE USUARIO: Como cliente, quiero crear una cuenta de forma segura.
     */
    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<UsuarioResponseDTO> registrarUsuario(@RequestBody RegistroDTO registroDTO) {
        return usuarioService.registrarUsuario(registroDTO)
                .map(usuario -> {
                    UsuarioResponseDTO responseDTO = new UsuarioResponseDTO();
                    responseDTO.setNombreUsuario(usuario.getNombreUsuario());
                    responseDTO.setEmail(usuario.getEmail());
                    responseDTO.setEstadoCuenta(usuario.getEstadoCuenta());
                    responseDTO.setFechaCreacion(usuario.getFechaCreacion());
                    return responseDTO;
                });
    }

    @PostMapping("/registro/rapido")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<UsuarioResponseDTO> registrarUsuarioRapido(@RequestBody RegistroRapidoDTO registroDTO) {
        return usuarioService.registrarUsuarioRapido(registroDTO)
                .map(usuario -> {
                    UsuarioResponseDTO responseDTO = new UsuarioResponseDTO();
                    responseDTO.setNombreUsuario(usuario.getNombreUsuario());
                    responseDTO.setEmail(usuario.getEmail());
                    responseDTO.setEstadoCuenta(usuario.getEstadoCuenta());
                    responseDTO.setFechaCreacion(usuario.getFechaCreacion());
                    return responseDTO;
                });
        //
    }

    /**
     * Lógica de Login/Autenticación con verificación segura de contraseña.
     */
    @PostMapping("/login")
    public Mono<JwtResponseDTO> login(@RequestBody LoginDTO loginDTO) {

        // 1. Cargar el usuario por username/email
        return userDetailsService.findByUsername(loginDTO.getUsername())
                .flatMap(userDetails -> {

                    // 2. Verificar contraseña
                    if (!passwordEncoder.matches(loginDTO.getPassword(), userDetails.getPassword())) {
                        // Contraseña incorrecta - devolver 401
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuario o contraseña incorrectos."));
                    }

                    // 3. Verificar estado de la cuenta
                    if (!userDetails.isEnabled()) {
                        // Obtener el usuario real para verificar el estado específico
                        return usuarioService.obtenerPorNombreUsuario(loginDTO.getUsername())
                                .flatMap(usuario -> {
                                    String estadoCuenta = usuario.getEstadoCuenta();

                                    // Si es PENDIENTE_PERFIL, permitimos el login pero marcamos perfilCompleto = false
                                    if ("PENDIENTE_PERFIL".equals(estadoCuenta)) {
                                          String token = jwtUtil.generateToken(userDetails);
                                          JwtResponseDTO response = new JwtResponseDTO();
                                          response.setToken(token);
                                          response.setPerfilCompleto(false);
                                          return Mono.just(response);
                                    }

                                    // Diferenciar entre otros estados de cuenta
                                    if ("BLOQUEADO".equals(estadoCuenta)) {
                                        return Mono.error(new ResponseStatusException(
                                                HttpStatus.FORBIDDEN,
                                                "Tu cuenta está bloqueada. Por favor contacta a soporte."));
                                    } else if ("PENDIENTE_ACTIVACION".equals(estadoCuenta)) {
                                        return Mono.error(new ResponseStatusException(
                                                HttpStatus.LOCKED,
                                                "Tu cuenta está pendiente de activación. Por favor revisa tu correo electrónico."));
                                    } else if ("SUSPENDIDO".equals(estadoCuenta)) {
                                        return Mono.error(new ResponseStatusException(
                                                HttpStatus.FORBIDDEN,
                                                "Tu cuenta ha sido suspendida. Contacta a soporte para más información."));
                                    } else {
                                        return Mono.error(new ResponseStatusException(
                                                HttpStatus.FORBIDDEN,
                                                "Tu cuenta no está activa."));
                                    }
                                });
                    }

                    // 4. Login exitoso (Estado ACTIVA o ENABLED)
                    // Verificar dinámicamente si el perfil está completo
                    return usuarioService.obtenerPorNombreUsuario(loginDTO.getUsername())
                        .flatMap(usuario -> 
                            perfilService.verificarPerfilCompleto(usuario.getIdUsuario())
                                .map(esCompleto -> {
                                    String token = jwtUtil.generateToken(userDetails);
                                    JwtResponseDTO response = new JwtResponseDTO();
                                    response.setToken(token);
                                    response.setPerfilCompleto(esCompleto);
                                    return response;
                                })
                        );
                })
                .onErrorResume(e -> {
                    // Manejo centralizado de errores
                    if (e instanceof ResponseStatusException) {
                        // Ya es una ResponseStatusException con el código y mensaje correcto
                        return Mono.error(e);
                    }

                    // Usuario no encontrado u otros errores de autenticación
                    if (e instanceof AuthenticationException ||
                            e.getMessage() != null && e.getMessage().contains("no encontrado")) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuario o contraseña incorrectos."));
                    }

                    // Error inesperado
                    return Mono.error(new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Error al procesar la solicitud de login."));
                });
    }
    /**
     * Endpoint para refrescar el token de sesión.
     * Requiere autenticación previa (Bearer Token).
     */
    @PostMapping("/refresh")
    public Mono<JwtResponseDTO> refreshToken(
            org.springframework.security.core.Authentication authentication) {
        
        // El principal es un String (username) establecido por JwtAuthenticationManager
        String username = authentication.getName();

        // Cargar los detalles del usuario actualizados desde la BD para generar el nuevo token
        return userDetailsService.findByUsername(username)
                .map(userDetails -> {
                    String newToken = jwtUtil.generateToken(userDetails);
                    JwtResponseDTO response = new JwtResponseDTO();
                    response.setToken(newToken);
                    return response;
                });
    }
}