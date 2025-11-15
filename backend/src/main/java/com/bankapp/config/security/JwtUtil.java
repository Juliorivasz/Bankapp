package com.bankapp.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration; // en milisegundos

    private Key getSigningKey() {
        // La clave secreta debe tener una longitud mínima para el algoritmo HS256.
        // Asegúrate de que tu secreto en application.properties sea lo suficientemente largo.
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Genera un token JWT para el usuario.
     */
    public String generateToken(UserDetails user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(Collectors.toList()));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Valida el token JWT (firma y expiración).
     * @param token El token a validar.
     * @return true si el token es válido.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            // Es una buena práctica registrar el error específico.
            System.err.println("Error en la validación del token JWT: " + e.getMessage());
            return false;
        }
    }

    /**
     * Extrae todos los claims (información) del token.
     * @param token El token del cual extraer la información.
     * @return El objeto Claims.
     */
    public Claims getAllClaimsFromToken(String token) {
        // Se actualiza al builder moderno, igual que en validateToken, para consistencia.
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Genera un token JWT para la verificación de email (vida corta).
     * @param email El email del usuario a verificar.
     */
    public String generateVerificationToken(String email) {
        long verificationExpiration = 24 * 60 * 60 * 1000; // 24 horas

        return Jwts.builder()
                .setSubject(email)
                // Claim personalizado para distinguir este token del token de sesión
                .claim("purpose", "VERIFICATION")
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + verificationExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Valida y extrae el sujeto (email) del token de verificación.
     * @param token El token JWT recibido.
     * @return El email del usuario.
     * @throws JwtException si el token es inválido o expirado.
     */
    public String getEmailFromVerificationToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secret)
                .build()
                .parseClaimsJws(token)
                .getBody();

        // Se puede añadir una verificación extra del propósito del token aquí si se desea.
        if (!"VERIFICATION".equals(claims.get("purpose"))) {
            throw new IllegalArgumentException("El token no es un token de verificación.");
        }

        return claims.getSubject();
    }
}
