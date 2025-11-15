package com.bankapp.controller;

import com.bankapp.model.Enum.EstadoCuenta;
import com.bankapp.model.Soporte;
import com.bankapp.model.Usuario;
import com.bankapp.model.dto.reporte.BalanceGlobalDTO;
import com.bankapp.model.dto.reporte.ReporteActividadDTO;
import com.bankapp.repository.UsuarioRepository;
import com.bankapp.service.AdminService;
import com.bankapp.service.SoporteService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final UsuarioRepository usuarioRepository;
    private final SoporteService soporteService;

    @GetMapping("/reporte/actividad")
    public Mono<ReporteActividadDTO> generarReporteActividad(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        return adminService.generarReporteActividad(fechaInicio, fechaFin);
    }

    /**
     * HISTORIA DE USUARIO: Balance Total Global por Moneda.
     * Ruta: GET /api/admin/reporte/balance-global
     */
    @GetMapping("/reporte/balance-global")
    public Flux<BalanceGlobalDTO> verBalanceGlobal() {

        return adminService.verBalanceGlobalPorMoneda();
    }

    @PutMapping("/usuarios/{id}/estado/{estado}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<Usuario> actualizarEstadoUsuario(@PathVariable Long id, @PathVariable String estado) {

        Mono<String> usernameMono = ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName);

        return usernameMono.flatMap(username -> {

            // Aquí deberías buscar el id del administrador por username, pero para simplificar
            // por ahora, asumiremos que ya lo tienes o lo buscas de forma reactiva en el servicio.
            // Como es una acción de ADMIN, necesitas el ID de ese usuario.

            // Nota: Si el ID del admin estuviera en el token, lo usarías directamente.
            // Aquí lo buscaremos por username para obtener el ID:

            return usuarioRepository.findByNombreUsuario(username)
                    .flatMap(adminUser -> {
                        EstadoCuenta nuevoEstado = EstadoCuenta.valueOf(estado.toUpperCase());
                        return adminService.actualizarEstadoUsuario(id, nuevoEstado, adminUser.getIdUsuario());
                    })
                    .onErrorResume(e -> Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage())));
        });
    }

    // --- 6. Ver Solicitudes ABIERTAS (Historia de Usuario) ---
    @GetMapping("/soporte/abiertas")
    public Flux<Soporte> obtenerSolicitudesAbiertas() {
        return soporteService.obtenerTodasLasSolicitudesAbiertas();
    }

    // --- 7. Cerrar Solicitud de Soporte ---
    // NOTA: Para un sistema real, aquí se añadiría el ID del Admin al log.
    @PutMapping("/soporte/{id}/cerrar")
    @ResponseStatus(HttpStatus.OK)
    public Mono<Soporte> cerrarSolicitud(@PathVariable Long id) {
        return soporteService.cerrarSolicitud(id);
    }
}
