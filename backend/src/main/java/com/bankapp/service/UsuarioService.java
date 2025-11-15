package com.bankapp.service;


import com.bankapp.config.security.JwtUtil;
import com.bankapp.model.*;
import com.bankapp.model.Enum.EstadoCuenta;
import com.bankapp.model.dto.usuario.RegistroDTO;
import com.bankapp.model.dto.usuario.RegistroRapidoDTO;
import com.bankapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PerfilUsuarioRepository perfilUsuarioRepository;
    private final DocumentoRepository documentoRepository;
    private final DireccionRepository direccionRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;
    private final PaisRepository paisRepository;
    private final PaisMonedaRepository paisMonedaRepository;

    private final JwtUtil jwtUtil;
    private final EmailService emailService;


    @Transactional
    public Mono<Usuario> registrarUsuario(RegistroDTO registroDTO) {
        Mono<Boolean> emailExistsMono = usuarioRepository.findByEmail(registroDTO.getEmail()).hasElement();
        Mono<Boolean> usernameExistsMono = usuarioRepository.findByNombreUsuario(registroDTO.getNombreUsuario()).hasElement();

        return Mono.zip(emailExistsMono, usernameExistsMono)
                .flatMap(exists -> {
                    boolean emailExistente = exists.getT1();
                    boolean usernameExistente = exists.getT2();

                    // 1. Validaciones de unicidad de email/username
                    if (emailExistente) {
                        return Mono.error(new IllegalArgumentException("El email ya está registrado."));
                    }
                    if (usernameExistente) {
                        return Mono.error(new IllegalArgumentException("El nombre de usuario ya está en uso."));
                    }

                    // 2. Obtener Rol y Crear Usuario principal
                    return rolRepository.findByNombreRol("CLIENTE")
                            .switchIfEmpty(Mono.error(new RuntimeException("Rol de cliente no encontrado.")))
                            .flatMap(rol -> {
                                Usuario nuevoUsuario = new Usuario();
                                nuevoUsuario.setNombreUsuario(registroDTO.getNombreUsuario());
                                nuevoUsuario.setEmail(registroDTO.getEmail());
                                nuevoUsuario.setPassword(passwordEncoder.encode(registroDTO.getPassword()));
                                nuevoUsuario.setIdRol(rol.getIdRol());
                                nuevoUsuario.setEstadoCuenta(EstadoCuenta.ACTIVA.name());
                                nuevoUsuario.setFechaCreacion(LocalDateTime.now());
                                return usuarioRepository.save(nuevoUsuario);
                            })
                            // 3. Encadenamiento: Ahora llamamos a los métodos auxiliares pasando también el DTO
                            .flatMap(usuarioGuardado ->
                                    crearPerfilYDocumentos(usuarioGuardado, registroDTO)
                            ).flatMap(usuarioGuardado -> crearWalletsIniciales(usuarioGuardado, registroDTO.getPais()));
                });
    }

    /**
     * Registra un usuario con solo los datos esenciales (Fase 1).
     */
    @Transactional
    public Mono<Usuario> registrarUsuarioRapido(RegistroRapidoDTO registroDTO) {
        Mono<Boolean> emailExistsMono = usuarioRepository.findByEmail(registroDTO.getEmail()).hasElement();
        Mono<Boolean> usernameExistsMono = usuarioRepository.findByNombreUsuario(registroDTO.getNombreUsuario()).hasElement();

        return Mono.zip(emailExistsMono, usernameExistsMono)
                .flatMap(exists -> {
                    boolean emailExistente = exists.getT1();
                    boolean usernameExistente = exists.getT2();

                    // 1. Validaciones de unicidad de email/username
                    if (emailExistente || usernameExistente) {
                        return Mono.error(new IllegalArgumentException(emailExistente ? "El email ya está registrado." : "El nombre de usuario ya está en uso."));
                    }

                    // 2. Obtener Rol y Crear Usuario principal (ESTADO: PENDIENTE_ACTIVACION)
                    // NOTA: Cambiamos PENDIENTE_PERFIL a PENDIENTE_ACTIVACION para el email
                    return crearUsuarioPrincipal(registroDTO.getNombreUsuario(), registroDTO.getEmail(), registroDTO.getPassword(), EstadoCuenta.PENDIENTE_ACTIVACION)

                            // 3. Crea perfil MÍNIMO y Dirección TEMPORAL
                            .flatMap(usuarioGuardado -> crearPerfilYDireccionTemporal(usuarioGuardado, registroDTO))

                            // 4. ENVÍO DE EMAIL Y CREACIÓN DE WALLETS (Secuencial)
                            .flatMap(usuarioGuardado -> {
                                // Generar JWT para verificación (el JWT lleva el estado)
                                String verificationToken = jwtUtil.generateVerificationToken(usuarioGuardado.getEmail());

                                // Envía el correo y luego continúa con la creación de wallets
                                return emailService.enviarCorreoVerificacion(usuarioGuardado, verificationToken)
                                        .then(crearWalletsIniciales(usuarioGuardado, registroDTO.getPais()));
                            });
                });
    }

    // metodo auxliar
    private Mono<Usuario> crearUsuarioPrincipal(String nombreUsuario, String email, String password, EstadoCuenta estado) {
        return rolRepository.findByNombreRol("CLIENTE")
                .switchIfEmpty(Mono.error(new RuntimeException("Rol de cliente no encontrado.")))
                .flatMap(rol -> {
                    Usuario nuevoUsuario = new Usuario();
                    nuevoUsuario.setNombreUsuario(nombreUsuario);
                    nuevoUsuario.setEmail(email);
                    nuevoUsuario.setPassword(passwordEncoder.encode(password));
                    nuevoUsuario.setIdRol(rol.getIdRol());
                    nuevoUsuario.setEstadoCuenta(estado.name());
                    nuevoUsuario.setFechaCreacion(LocalDateTime.now());
                    return usuarioRepository.save(nuevoUsuario);
                });
    }

    private Mono<Usuario> crearPerfilYDocumentos(Usuario usuarioGuardado, RegistroDTO registroDTO) {

        // 3. Crear y guardar el perfil de usuario.
        PerfilUsuario perfil = new PerfilUsuario();
        perfil.setIdUsuario(usuarioGuardado.getIdUsuario());
        perfil.setNombre(registroDTO.getNombre());
        perfil.setApellido(registroDTO.getApellido());
        perfil.setFechaNacimiento(registroDTO.getFechaNacimiento());
        perfil.setNumeroTelefono(registroDTO.getNumeroTelefono());

        return perfilUsuarioRepository.save(perfil)
                .flatMap(perfilGuardado -> {
                    // 4. Crear y guardar el documento.
                    Documento documento = new Documento();
                    documento.setIdPerfil(perfilGuardado.getIdPerfil());
                    documento.setTipoDocumento(registroDTO.getTipoDocumento());
                    documento.setNumeroDocumento(registroDTO.getNumeroDocumento());
                    documento.setFechaExpiracion(registroDTO.getFechaExpiracion());
                    documento.setEstadoVerificacion("PENDIENTE");
                    documento.setFechaSubida(LocalDateTime.now());
                    return documentoRepository.save(documento).thenReturn(perfilGuardado);
                })
                .flatMap(perfilGuardado -> {
                    // 5. Crear y guardar la dirección.
                    Direccion direccion = new Direccion();
                    direccion.setIdPerfil(perfilGuardado.getIdPerfil());
                    direccion.setCalle(registroDTO.getCalle());
                    direccion.setCiudad(registroDTO.getCiudad());
                    direccion.setCodigoPostal(registroDTO.getCodigoPostal());
                    direccion.setPais(registroDTO.getPais());
                    direccion.setEsPrincipal(true);

                    // Al final de la cadena, devolvemos el objeto Usuario original
                    return direccionRepository.save(direccion).thenReturn(usuarioGuardado);
                });
    }

    // METODO NUEVO: Para el registro RÁPIDO (Crea Perfil MÍNIMO y Dirección TEMPORAL)
    private Mono<Usuario> crearPerfilYDireccionTemporal(Usuario usuarioGuardado, RegistroRapidoDTO registroDTO) {

        // 1. Crear el perfil MÍNIMO (Datos PENDIENTES)
        PerfilUsuario perfil = new PerfilUsuario();
        perfil.setIdUsuario(usuarioGuardado.getIdUsuario());
        perfil.setNombre("PENDIENTE");
        perfil.setApellido("PENDIENTE");
        perfil.setFechaNacimiento(java.time.LocalDate.now());
        perfil.setNumeroTelefono("PENDIENTE");

        return perfilUsuarioRepository.save(perfil)
                .flatMap(perfilGuardado -> {
                    // La creación del Documento se omite ya que solo se hace en el registro completo.
                    // 2. Crear la dirección TEMPORAL
                    Direccion direccion = new Direccion();
                    direccion.setIdPerfil(perfilGuardado.getIdPerfil());
                    direccion.setCalle("PENDIENTE");
                    direccion.setCiudad("PENDIENTE");
                    direccion.setCodigoPostal("PENDIENTE");
                    direccion.setPais(registroDTO.getPais());
                    direccion.setEsPrincipal(true);

                    // 3. Guardar y devolver el usuario
                    return direccionRepository.save(direccion).thenReturn(usuarioGuardado);
                });
    }

    private Mono<Usuario> crearWalletsIniciales(Usuario usuarioGuardado, String nombrePais) {

        Mono<Pais> paisMono = paisRepository.findByNombrePais(nombrePais)
                .switchIfEmpty(Mono.error(new RuntimeException("Error: País '" + nombrePais + "' no soportado o no encontrado.")));

        return paisMono.flatMap(pais -> {
            Flux<PaisMoneda> monedasPrincipalesFlux = paisMonedaRepository.findByIdPaisAndEsPrincipalIsTrue(pais.getIdPais());

            return monedasPrincipalesFlux
                    .distinct(PaisMoneda::getIdMoneda)
                    .flatMap(paisMoneda -> walletService.crearWalletInicial(usuarioGuardado.getIdUsuario(), paisMoneda.getIdMoneda()))
                    .collectList()
                    .thenReturn(usuarioGuardado);
        });
    }

    @Transactional
    public Mono<Usuario> verificarToken(String token) {
        try {
            String email = jwtUtil.getEmailFromVerificationToken(token);

            return usuarioRepository.findByEmail(email)
                    .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado para la activación.")))
                    .flatMap(usuario -> {

                        // 3. Activar la cuenta
                        if (usuario.getEstadoCuenta().equals(EstadoCuenta.ACTIVA.name())) {
                            return Mono.error(new IllegalArgumentException("La cuenta ya está activa."));
                        }

                        usuario.setEstadoCuenta(EstadoCuenta.ACTIVA.name());
                        return usuarioRepository.save(usuario);
                    });

        } catch (io.jsonwebtoken.JwtException e) {
            // Captura tokens inválidos o expirados para el GlobalExceptionHandler
            return Mono.error(new IllegalArgumentException("Token de verificación inválido o expirado."));
        }
    }

    public Mono<Usuario> obtenerPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario);
    }

    /**
     * Verifica si un nombre de usuario ya existe en la base de datos.
     * Utilizado para validación en tiempo real en el frontend.
     * @param nombreUsuario Nombre de usuario a verificar.
     * @return Mono<Boolean> que emite 'true' si el usuario NO existe, o un error si ya existe.
     */
    public Mono<Boolean> validarUsuarioNoExiste(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario).hasElement()
                .flatMap(existe -> {
                    if (existe) {
                        return Mono.error(new IllegalArgumentException("El nombre de usuario ya está en uso."));
                    }
                    return Mono.just(true);
                });
    }

    public Mono<Long> obtenerIdUsuarioPorNombreUsuario(String username) {
        return usuarioRepository.findByNombreUsuario(username)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado.")))
                .map(Usuario::getIdUsuario);
    }
}