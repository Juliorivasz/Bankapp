package com.bankapp.config.security;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtServerAuthenticationConverter implements ServerAuthenticationConverter {

    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        // 1. Busca el encabezado "Authorization"
        return Mono.justOrEmpty(exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION))
                // 2. Filtra solo los que comienzan con "Bearer "
                .filter(authHeader -> authHeader.startsWith(BEARER_PREFIX))
                // 3. Elimina el prefijo para obtener solo el token
                .map(authHeader -> authHeader.substring(BEARER_PREFIX.length()))
                // 4. Crea un objeto de autenticación preliminar que será procesado por el AuthenticationManager
                .map(token -> new UsernamePasswordAuthenticationToken(token, token));
    }
}
