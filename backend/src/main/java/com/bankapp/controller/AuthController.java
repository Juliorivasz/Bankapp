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
    @GetMapping("/usuario/validar")
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

                    if (passwordEncoder.matches(loginDTO.getPassword(), userDetails.getPassword())) {

                        String token = jwtUtil.generateToken(userDetails);
                        JwtResponseDTO response = new JwtResponseDTO();
                        response.setToken(token);

                        return Mono.just(response);

                    } else {
                        // Si la contraseña NO coincide, lanza 401
                        return Mono.error(new AuthenticationException("Credenciales inválidas.") {});
                    }
                })
                .onErrorResume(e -> {
                    // Manejo centralizado de errores de login
                    // AuthenticationException, UsernameNotFoundException, etc. se convierten a 401
                    if (e instanceof AuthenticationException || e instanceof RuntimeException && e.getMessage().contains("no encontrado")) {
                        return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas o usuario no encontrado."));
                    }
                    // Otros errores se propagan
                    return Mono.error(e);
                });
    }
}