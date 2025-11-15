package com.bankapp.config;

import io.swagger.v3.oas.models.Components; // NUEVO
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement; // NUEVO
import io.swagger.v3.oas.models.security.SecurityScheme; // NUEVO
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "BearerAuth"; // Nombre de referencia interna

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BankApp - API Reactiva de Wallet")
                        .version("1.0.0")
                        .description("Backend RESTful para la aplicación de billetera digital, implementado con Spring WebFlux y R2DBC."))

                // 1. DEFINICIÓN DEL ESQUEMA DE SEGURIDAD (JWT)
                .components(new Components()
                        .addSecuritySchemes(SCHEME_NAME,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP) // Usamos el esquema HTTP
                                        .scheme("bearer") // Indicamos que es un token Bearer
                                        .bearerFormat("JWT") // Especificamos el formato
                                        .in(SecurityScheme.In.HEADER) // El token va en el encabezado
                                        .name("Authorization") // El nombre del encabezado
                        )
                );
    }
}