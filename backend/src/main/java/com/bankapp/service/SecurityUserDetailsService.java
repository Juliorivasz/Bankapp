package com.bankapp.service;

import com.bankapp.repository.RolRepository;
import com.bankapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SecurityUserDetailsService implements ReactiveUserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Override
    public Mono<UserDetails> findByUsername(String username) {
        // En un sistema real, podrías buscar por nombreUsuario o email
        return usuarioRepository.findByNombreUsuario(username)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("Usuario no encontrado: " + username)))
                .flatMap(usuario -> {

                    return rolRepository.findById(usuario.getIdRol())
                            .switchIfEmpty(Mono
                                    .error(new RuntimeException("Rol no asignado o no encontrado para el usuario.")))
                            .map(rol -> {

                                String nombreRol = rol.getNombreRol().toUpperCase();
                                List<GrantedAuthority> authorities = Collections.singletonList(
                                        new SimpleGrantedAuthority("ROLE_" + nombreRol));

                                // Determinar si la cuenta está habilitada basándose en el estado
                                boolean isEnabled = "ACTIVA".equals(usuario.getEstadoCuenta());

                                return new org.springframework.security.core.userdetails.User(
                                        usuario.getNombreUsuario(),
                                        usuario.getPassword(),
                                        isEnabled, // enabled
                                        true, // accountNonExpired
                                        true, // credentialsNonExpired
                                        true, // accountNonLocked
                                        authorities);
                            });
                });
    }
}