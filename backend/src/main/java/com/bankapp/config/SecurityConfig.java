package com.bankapp.config;

import com.bankapp.config.security.JwtAuthenticationManager;
import com.bankapp.config.security.JwtServerAuthenticationConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationManager authenticationManager;
    private final JwtServerAuthenticationConverter authenticationConverter;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {

        // Este filtro interceptará las peticiones para procesar el token JWT
        AuthenticationWebFilter authenticationWebFilter = new AuthenticationWebFilter(authenticationManager);
        authenticationWebFilter.setServerAuthenticationConverter(authenticationConverter);

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                // Indicar que la aplicación es "stateless" (sin sesión)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())

                // Manejo de excepciones de seguridad
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint((swe, e) ->
                                Mono.fromRunnable(() -> swe.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED))
                        )
                        .accessDeniedHandler((swe, e) ->
                                Mono.fromRunnable(() -> swe.getResponse().setStatusCode(HttpStatus.FORBIDDEN))
                        )
                )

                // Reglas de autorización para las rutas
                .authorizeExchange(exchanges -> exchanges
                        // Tus rutas públicas
                        .pathMatchers("/api/auth/registro/**",
                                "/api/auth/login",
                                "/api/auth/usuario/validar",
                                "/api/paises/**",
                                "/api/publico/**",
                                "/ping").permitAll()
                        .pathMatchers("/v3/api-docs/**").permitAll()
                        // rutas de swagger
                        .pathMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/webjars/**").permitAll()
                        // Todas las demás rutas requieren autenticación
                        .anyExchange().authenticated()
                )

                // Añadir nuestro filtro personalizado de JWT en el punto correcto de la cadena de seguridad
                .addFilterAt(authenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)

                .build();
    }
}
