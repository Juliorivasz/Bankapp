package com.bankapp.controller;

import com.bankapp.model.Soporte;
import com.bankapp.model.Transaccion;
import com.bankapp.model.Wallet;
import com.bankapp.model.dto.dashboard.DashboardDTO;
import com.bankapp.model.dto.soporte.NuevaSolicitudDTO;
import com.bankapp.model.dto.transferencia.DepositoDTO;
import com.bankapp.model.dto.transferencia.RetiroDTO;
import com.bankapp.model.dto.transferencia.TransferenciaDTO;
import com.bankapp.model.dto.wallet.NuevaWalletDTO;
import com.bankapp.repository.TipoMonedaRepository;
import com.bankapp.service.DashboardService;
import com.bankapp.service.NotificacionService;
import com.bankapp.service.PerfilService;
import com.bankapp.service.SoporteService;
import com.bankapp.service.TransaccionService;
import com.bankapp.service.UsuarioService;
import com.bankapp.service.WalletService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
@SecurityRequirement(name = "BearerAuth")
public class ClienteController {

        private final TransaccionService transaccionService;
        private final WalletService walletService;
        private final UsuarioService usuarioService;
        private final SoporteService soporteService;
        private final TipoMonedaRepository tipoMonedaRepository;
        private final DashboardService dashboardService;
        private final PerfilService perfilService;
        private final NotificacionService notificacionService;

        @GetMapping("/dashboard")
        public Mono<DashboardDTO> obtenerDashboard(
            Mono<Authentication> auth,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime to
        ) {
                return auth.flatMap(a -> dashboardService.obtenerDashboard(a.getName(), from, to));
        }

        // --- 1. Ver Balance (Historia de Usuario) ---
        @GetMapping("/wallets")
        public Flux<Wallet> verBalance(Mono<Authentication> auth) {
                return auth.flatMapMany(
                                authentication -> walletService.verBalancePorNombreUsuario(authentication.getName()));
        }

        // --- 2. Enviar Dinero (Transferencia) ---
        @PostMapping("/transferir")
        @ResponseStatus(HttpStatus.CREATED)
        public Mono<Transaccion> enviarDinero(Mono<Authentication> auth, @RequestBody TransferenciaDTO dto) {
                return auth.flatMap(authentication -> usuarioService
                                .obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                                .flatMap(idUsuarioOrigen -> transaccionService.enviarDinero(idUsuarioOrigen, dto)));
        }

        // --- 3. Depósito ---
        @PostMapping("/depositar")
        @ResponseStatus(HttpStatus.CREATED)
        public Mono<Transaccion> depositar(Mono<Authentication> auth, @RequestBody DepositoDTO dto) {
                return auth.flatMap(authentication -> usuarioService
                                .obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                                .flatMap(idUsuario ->
                                // PASAR ID DEL USUARIO AUTENTICADO AL SERVICIO
                                transaccionService.depositar(idUsuario, dto)));
        }

        // --- 4. Retiro ---
        @PostMapping("/retirar")
        @ResponseStatus(HttpStatus.ACCEPTED)
        public Mono<Transaccion> retirar(Mono<Authentication> auth, @RequestBody RetiroDTO dto) {
                return auth.flatMap(authentication -> usuarioService
                                .obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                                .flatMap(idUsuario ->
                                // PASAR ID DEL USUARIO AUTENTICADO AL SERVICIO
                                transaccionService.retirar(idUsuario, dto)));
        }

        // --- 5. Ver Historial ---
        @GetMapping("/transacciones/{numeroCuenta}")
        public Flux<Transaccion> verHistorial(@PathVariable String numeroCuenta) {
                return transaccionService.verHistorial(numeroCuenta);
        }

        // --- 6. Crear Solicitud de Soporte ---
        @PostMapping("/soporte")
        @ResponseStatus(HttpStatus.CREATED)
        public Mono<Soporte> crearSolicitud(@RequestBody NuevaSolicitudDTO dto, Mono<Authentication> auth) {

                // Obtener el nombre de usuario autenticado (principal)
                return auth.flatMap(authentication -> soporteService.crearSolicitud(authentication.getName(), dto))
                // El GlobalExceptionHandler maneja las RuntimeExceptions (ej: Usuario no
                // encontrado)
                ;
        }

        // --- 7. Ver Historial de Soporte (Solo tickets propios) ---
        @GetMapping("/soporte")
        public Flux<Soporte> obtenerMisSolicitudes(Mono<Authentication> auth) {

                // Obtenemos el ID del usuario actual para buscar solo sus tickets
                return auth.flatMap(authentication -> usuarioService
                                .obtenerIdUsuarioPorNombreUsuario(authentication.getName()))
                                .flatMapMany(soporteService::obtenerSolicitudesPorUsuario);
        }

        /**
          * Permite al cliente crear una wallet adicional para una moneda soportada.
         * Ruta: POST /api/cliente/wallets/adicionar
         */
        @PostMapping("/wallet/nueva")
        @ResponseStatus(HttpStatus.CREATED)
        public Mono<Wallet> adicionarWallet(Mono<Authentication> auth, @RequestBody NuevaWalletDTO dto) {

                // 1. Obtener el ID del usuario autenticado
                Mono<Long> idUsuarioMono = auth.flatMap(authentication -> usuarioService
                                .obtenerIdUsuarioPorNombreUsuario(authentication.getName()));

                // 2. Obtener el ID de la moneda
                Mono<Long> idMonedaMono = tipoMonedaRepository.findBySimboloMoneda(dto.getSimboloMoneda())
                                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "Moneda con símbolo '" + dto.getSimboloMoneda() + "' no soportada.")))
                                .map(tipoMoneda -> tipoMoneda.getIdMoneda());

                return Mono.zip(idUsuarioMono, idMonedaMono)
                                .flatMap(tuple -> {
                                        Long idUsuario = tuple.getT1();
                                        Long idMoneda = tuple.getT2();
                                        return walletService.crearWalletAdicional(idUsuario, idMoneda);
                                })
                                .onErrorResume(e -> Mono.error(
                                                new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage())));
        }
        
        // --- 8. Intercambio entre Wallets (Interno) ---
        @PostMapping("/intercambiar")
        @ResponseStatus(HttpStatus.CREATED)
        public Mono<Transaccion> intercambiar(Mono<Authentication> auth, @RequestBody com.bankapp.model.dto.transferencia.IntercambioDTO dto) {
            return auth.flatMap(authentication -> usuarioService
                            .obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                            .flatMap(idUsuario -> transaccionService.intercambiar(idUsuario, dto)));
        }

        // --- 8. Validar Destinatario (Para Transferencias) ---
        @GetMapping("/transferencias/destinatarios/recientes")
        public Flux<com.bankapp.model.dto.transferencia.DestinatarioDTO> obtenerDestinatariosRecientes(Mono<Authentication> auth) {
            return auth.flatMap(authentication -> usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName()))
                .flatMapMany(transaccionService::obtenerDestinatariosRecientes);
        }

        // --- 9. Obtener Monedas Soportadas ---
        @GetMapping("/monedas")
        public Flux<com.bankapp.model.TipoMoneda> obtenerMonedasSoportadas() {
            return tipoMonedaRepository.findAll();
        }

        // --- 8. Validar Destinatario (Para Transferencias) ---
        @GetMapping("/destinatario/validar")
        public Mono<com.bankapp.model.dto.transferencia.DestinatarioDTO> validarDestinatario(
            Mono<Authentication> auth,
            @RequestParam String dato, // Alias o CBU
            @RequestParam String moneda // Simbolo (ARS, USD) para validar compatibilidad
        ) {
            // Lógica duplicada de TransaccionService (idealmente mover a un servicio)
            return auth.flatMap(authentication -> usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName()))
                .flatMap(idUsuarioAuth -> 
                    tipoMonedaRepository.findBySimboloMoneda(moneda)
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Moneda no soportada")))
                        .flatMap(monedaEntity -> {
                            // Buscar por CBU
                            return walletService.buscarPorNumeroCuenta(dato)
                                .filter(wallet -> !wallet.getIdUsuario().equals(idUsuarioAuth)) // <--- NO permitirse a sí mismo
                                .flatMap(wallet -> usuarioService.obtenerUsuarioPorId(wallet.getIdUsuario())
                                    .map(u -> {
                                        if (!wallet.getIdMoneda().equals(monedaEntity.getIdMoneda())) {
                                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cuenta destino no es de moneda " + moneda);
                                        }
                                        return new com.bankapp.model.dto.transferencia.DestinatarioDTO(
                                            u.getIdUsuario(),
                                            u.getNombreUsuario(), // Retornamos nombreUsuario como "Nombre Completo" por ahora
                                            u.getNombreUsuario(),
                                            wallet.getNumeroCuenta(),
                                            "BankApp",
                                            moneda // Asumimos que la wallet encontrada es de esta moneda
                                        );
                                    }))
                                .switchIfEmpty(
                                    // Buscar por Alias/Username
                                    usuarioService.obtenerIdUsuarioPorNombreUsuario(dato)
                                        .filter(idEncontrado -> !idEncontrado.equals(idUsuarioAuth)) // <--- NO permitirse a sí mismo
                                        .flatMap(idUsuario -> walletService.buscarPorUsuarioYMoneda(idUsuario, monedaEntity.getIdMoneda())
                                            .flatMap(wallet -> usuarioService.obtenerUsuarioPorId(idUsuario)
                                                .map(u -> new com.bankapp.model.dto.transferencia.DestinatarioDTO(
                                                    u.getIdUsuario(),
                                                    u.getNombreUsuario(),
                                                    u.getNombreUsuario(),
                                                    wallet.getNumeroCuenta(),
                                                    "BankApp",
                                                    moneda // Symbol
                                                ))
                                            )
                                        )
                                )
                                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Destinatario no encontrado, es usted mismo o no tiene cuenta en " + moneda)));
                        })
                );
        }
        // --- 10. Busqueda Avanzada de Transacciones ---
        @GetMapping("/transacciones/busqueda")
        public Mono<org.springframework.data.domain.Page<Transaccion>> buscarTransacciones(
            Mono<Authentication> auth,
            @RequestParam(required = false) Long idWallet,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime fechaInicio,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime fechaFin,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
        ) {
            return auth.flatMap(authentication -> usuarioService
                    .obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                    .flatMap(idUsuario -> transaccionService.buscarTransacciones(
                        idUsuario, idWallet, fechaInicio, fechaFin, tipo, busqueda, page, size
                     )));
        }

        // --- 11. Gestión de Perfil ---
        @GetMapping("/perfil")
        public Mono<com.bankapp.model.dto.perfil.PerfilDTO> obtenerPerfil(Mono<Authentication> auth) {
            return auth.flatMap(authentication -> perfilService.obtenerPerfil(authentication.getName()));
        }

        @PutMapping("/perfil")
        public Mono<com.bankapp.model.dto.perfil.PerfilDTO> actualizarPerfil(
            Mono<Authentication> auth,
            @RequestBody com.bankapp.model.dto.perfil.ActualizarPerfilDTO dto
        ) {
            return auth.flatMap(authentication -> perfilService.actualizarPerfil(authentication.getName(), dto));
        }

        @PutMapping("/perfil/password")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public Mono<Void> cambiarPassword(
            Mono<Authentication> auth,
            @RequestBody com.bankapp.model.dto.perfil.CambiarPasswordDTO dto
        ) {
            return auth.flatMap(authentication -> perfilService.cambiarPassword(authentication.getName(), dto));
        }

        @PostMapping("/perfil/completar")
        public Mono<com.bankapp.model.dto.perfil.PerfilDTO> completarPerfil(
            Mono<Authentication> auth,
            @RequestBody com.bankapp.model.dto.perfil.ActualizarPerfilDTO dto
        ) {
            return auth.flatMap(authentication -> perfilService.completarPerfilPendiente(authentication.getName(), dto));
        }

        // --- 12. Gestión de Notificaciones ---
        @GetMapping("/notificaciones")
        public Flux<com.bankapp.model.Notificacion> obtenerNotificaciones(Mono<Authentication> auth) {
            return auth.flatMap(authentication -> usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName()))
                    .flatMapMany(notificacionService::obtenerNotificaciones);
        }

        @GetMapping("/notificaciones/no-leidas")
        public Flux<com.bankapp.model.Notificacion> obtenerNotificacionesNoLeidas(Mono<Authentication> auth) {
            return auth.flatMap(authentication -> usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName()))
                    .flatMapMany(notificacionService::obtenerNoLeidas);
        }

        @GetMapping("/notificaciones/contador")
        public Mono<Long> contarNotificacionesNoLeidas(Mono<Authentication> auth) {
            return auth.flatMap(authentication -> usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName()))
                    .flatMap(notificacionService::contarNoLeidas);
        }

        @PutMapping("/notificaciones/{id}/leer")
        public Mono<com.bankapp.model.Notificacion> marcarNotificacionComoLeida(@PathVariable Long id) {
            return notificacionService.marcarComoLeida(id);
        }

        @PutMapping("/notificaciones/leer-todas")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public Mono<Void> marcarTodasComoLeidas(Mono<Authentication> auth) {
            return auth.flatMap(authentication -> usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName()))
                    .flatMap(notificacionService::marcarTodasComoLeidas);
        }

        @DeleteMapping("/notificaciones/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public Mono<Void> eliminarNotificacion(@PathVariable Long id) {
            return notificacionService.eliminarNotificacion(id);
        }
}
