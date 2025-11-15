package com.bankapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;

@Configuration
@EnableWebFlux // Habilita la configuración de WebFlux
public class CorsConfig implements WebFluxConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**") // Aplica la configuración a TODAS las rutas (endpoints)

                // Orígenes Permitidos (Tu frontend local)
                // Debes reemplazar http://localhost:3000 con el puerto real de tu frontend
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:3000", "http://localhost:4200", "http://localhost:8081")

                // Métodos Permitidos (POST, GET, PUT, DELETE, OPTIONS)
                .allowedMethods("*")

                // Encabezados Permitidos (Permite Authorization, Content-Type, etc.)
                .allowedHeaders("*")

                // Permitir credenciales (cookies o autenticación HTTP, aunque JWT no las usa)
                .allowCredentials(true)

                // Tiempo de validez de la respuesta pre-vuelo (en segundos)
                .maxAge(3600);
    }
}