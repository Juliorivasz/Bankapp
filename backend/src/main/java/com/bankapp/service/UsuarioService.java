package com.bankapp.service;


import com.bankapp.model.*;
import com.bankapp.model.Enum.EstadoCuenta;
import com.bankapp.model.dto.usuario.RegistroDTO;
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
                            ).flatMap(usuarioGuardado -> crearWalletsIniciales(usuarioGuardado, registroDTO));
                });
    }

    // Nota: La firma del metodo auxiliar debe incluir el RegistroDTO para acceder a los datos.
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


    // CAMBIO 3: Lógica para crear Wallets Iniciales (usa Pais y PaisMoneda)
    private Mono<Usuario> crearWalletsIniciales(Usuario usuarioGuardado, RegistroDTO registroDTO) {

        String nombrePais = registroDTO.getPais();

        // 1. Encontrar el País por su nombre
        Mono<Pais> paisMono = paisRepository.findByNombrePais(nombrePais)
                .switchIfEmpty(Mono.error(new RuntimeException("Error: País '" + nombrePais + "' no soportado o no encontrado.")));

        return paisMono.flatMap(pais -> {

            // 2. Buscar TODAS las monedas PRINCIPALES asociadas a ese país
            Flux<PaisMoneda> monedasPrincipalesFlux =
                    paisMonedaRepository.findByIdPaisAndEsPrincipalIsTrue(pais.getIdPais());

            // 3. Crear una Wallet para CADA moneda principal encontrada
            return monedasPrincipalesFlux
                    .flatMap(paisMoneda ->
                            walletService.crearWalletInicial(usuarioGuardado.getIdUsuario(), paisMoneda.getIdMoneda())
                    )
                    // 4. Esperar a que TODAS las wallets se creen (collectList) y devolver el Mono del Usuario
                    .collectList()
                    .thenReturn(usuarioGuardado);
        });
    }

    public Mono<Usuario> obtenerPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario);
    }

    public Mono<Long> obtenerIdUsuarioPorNombreUsuario(String username) {
        return usuarioRepository.findByNombreUsuario(username)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado.")))
                .map(Usuario::getIdUsuario);
    }
}