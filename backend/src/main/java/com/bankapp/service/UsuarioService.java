package com.bankapp.service;


import com.bankapp.model.Direccion;
import com.bankapp.model.Documento;
import com.bankapp.model.Enum.EstadoCuenta;
import com.bankapp.model.PerfilUsuario;
import com.bankapp.model.Usuario;
import com.bankapp.model.dto.usuario.RegistroDTO;
import com.bankapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PerfilUsuarioRepository perfilUsuarioRepository;
    private final DocumentoRepository documentoRepository;
    private final DireccionRepository direccionRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                          PerfilUsuarioRepository perfilUsuarioRepository, DocumentoRepository documentoRepository,
                          DireccionRepository direccionRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.perfilUsuarioRepository = perfilUsuarioRepository;
        this.documentoRepository = documentoRepository;
        this.direccionRepository = direccionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Mono<Usuario> registrarUsuario(RegistroDTO registroDTO) {
        // 1. Validar que el email o el nombre de usuario no existan.
        Mono<Boolean> emailExists = usuarioRepository.findByEmail(registroDTO.getEmail()).hasElement();
        Mono<Boolean> usernameExists = usuarioRepository.findByNombreUsuario(registroDTO.getNombreUsuario()).hasElement();

        return Mono.zip(emailExists, usernameExists)
                .flatMap(exists -> {
                    boolean emailExistente = exists.getT1();
                    boolean usernameExistente = exists.getT2();

                    if (emailExistente) {
                        return Mono.error(new IllegalArgumentException("El email ya está registrado."));
                    }
                    if (usernameExistente) {
                        return Mono.error(new IllegalArgumentException("El nombre de usuario ya está en uso."));
                    }

                    // 2. Obtener el rol de cliente y crear el usuario principal.
                    return rolRepository.findByNombreRol("CLIENTE")
                            .switchIfEmpty(Mono.error(new RuntimeException("Rol de cliente no encontrado.")))
                            .flatMap(rol -> {
                                Usuario nuevoUsuario = new Usuario();
                                nuevoUsuario.setNombreUsuario(registroDTO.getNombreUsuario());
                                nuevoUsuario.setEmail(registroDTO.getEmail());
                                nuevoUsuario.setPassword(passwordEncoder.encode(registroDTO.getPassword()));
                                nuevoUsuario.setIdRol(rol.getIdRol());
                                nuevoUsuario.setEstadoCuenta(EstadoCuenta.ACTIVA);
                                nuevoUsuario.setFechaCreacion(LocalDateTime.now());
                                return usuarioRepository.save(nuevoUsuario);
                            })
                            .flatMap(usuarioGuardado -> {
                                // 3. Crear y guardar el perfil de usuario.
                                PerfilUsuario perfil = new PerfilUsuario();
                                perfil.setIdUsuario(usuarioGuardado.getIdUsuario());
                                perfil.setNombre(registroDTO.getNombre());
                                perfil.setApellido(registroDTO.getApellido());
                                perfil.setFechaNacimiento(registroDTO.getFechaNacimiento());
                                perfil.setNumeroTelefono(registroDTO.getNumeroTelefono());
                                return perfilUsuarioRepository.save(perfil).thenReturn(usuarioGuardado);
                            })
                            .flatMap(usuarioGuardado -> {
                                // 4. Crear y guardar el documento.
                                return perfilUsuarioRepository.findByIdUsuario(usuarioGuardado.getIdUsuario())
                                        .flatMap(perfilGuardado -> {
                                            Documento documento = new Documento();
                                            documento.setIdPerfil(perfilGuardado.getIdPerfil());
                                            documento.setTipoDocumento(registroDTO.getTipoDocumento());
                                            documento.setNumeroDocumento(registroDTO.getNumeroDocumento());
                                            documento.setFechaExpiracion(registroDTO.getFechaExpiracion());
                                            documento.setEstadoVerificacion("PENDIENTE");
                                            documento.setFechaSubida(LocalDateTime.now());
                                            return documentoRepository.save(documento).thenReturn(usuarioGuardado);
                                        });
                            })
                            .flatMap(usuarioGuardado -> {
                                // 5. Crear y guardar la dirección.
                                return perfilUsuarioRepository.findByIdUsuario(usuarioGuardado.getIdUsuario())
                                        .flatMap(perfilGuardado -> {
                                            Direccion direccion = new Direccion();
                                            direccion.setIdPerfil(perfilGuardado.getIdPerfil());
                                            direccion.setCalle(registroDTO.getCalle());
                                            direccion.setCiudad(registroDTO.getCiudad());
                                            direccion.setCodigoPostal(registroDTO.getCodigoPostal());
                                            direccion.setPais(registroDTO.getPais());
                                            direccion.setEsPrincipal(true);
                                            return direccionRepository.save(direccion).thenReturn(usuarioGuardado);
                                        });
                            });
                });
    }

    public Mono<Usuario> obtenerPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario);
    }
}