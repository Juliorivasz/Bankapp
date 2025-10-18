package com.bankapp.controller;

import com.bankapp.model.Soporte;
import com.bankapp.model.Transaccion;
import com.bankapp.model.Wallet;
import com.bankapp.model.dto.soporte.NuevaSolicitudDTO;
import com.bankapp.model.dto.transferencia.DepositoDTO;
import com.bankapp.model.dto.transferencia.RetiroDTO;
import com.bankapp.model.dto.transferencia.TransferenciaDTO;
import com.bankapp.model.dto.wallet.NuevaWalletDTO;
import com.bankapp.repository.TipoMonedaRepository;
import com.bankapp.service.SoporteService;
import com.bankapp.service.TransaccionService;
import com.bankapp.service.UsuarioService;
import com.bankapp.service.WalletService;
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
public class ClienteController {

    private final TransaccionService transaccionService;
    private final WalletService walletService;
    private final UsuarioService usuarioService;
    private final SoporteService soporteService;
    private final TipoMonedaRepository tipoMonedaRepository;

    // --- 1. Ver Balance (Historia de Usuario) ---
    @GetMapping("/wallets")
    public Flux<Wallet> verBalance(Mono<Authentication> auth) {
        return auth.flatMapMany(authentication ->
                walletService.verBalancePorNombreUsuario(authentication.getName())
        );
    }

    // --- 2. Enviar Dinero (Transferencia) ---
    @PostMapping("/transferir")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Transaccion> enviarDinero(Mono<Authentication> auth, @RequestBody TransferenciaDTO dto) {
        return auth.flatMap(authentication ->
                usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                        .flatMap(idUsuarioOrigen -> transaccionService.enviarDinero(idUsuarioOrigen, dto))
        );
    }

    // --- 3. Depósito ---
    @PostMapping("/depositar")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Transaccion> depositar(Mono<Authentication> auth, @RequestBody DepositoDTO dto) {
        return auth.flatMap(authentication ->
                usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                        .flatMap(idUsuario ->
                                // PASAR ID DEL USUARIO AUTENTICADO AL SERVICIO
                                transaccionService.depositar(idUsuario, dto)
                        )
        );
    }

    // --- 4. Retiro ---
    @PostMapping("/retirar")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Mono<Transaccion> retirar(Mono<Authentication> auth, @RequestBody RetiroDTO dto) {
        return auth.flatMap(authentication ->
                usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                        .flatMap(idUsuario ->
                                // PASAR ID DEL USUARIO AUTENTICADO AL SERVICIO
                                transaccionService.retirar(idUsuario, dto)
                        )
        );
    }

    // --- 5. Ver Historial ---
    @GetMapping("/transacciones/{idWallet}")
    public Flux<Transaccion> verHistorial(@PathVariable String numeroCuenta) {
        return transaccionService.verHistorial(numeroCuenta);
    }


    // --- 6. Crear Solicitud de Soporte (Historia de Usuario) ---
    @PostMapping("/soporte")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Soporte> crearSolicitud(@RequestBody NuevaSolicitudDTO dto, Mono<Authentication> auth) {

        // Obtener el nombre de usuario autenticado (principal)
        return auth.flatMap(authentication ->
                soporteService.crearSolicitud(authentication.getName(), dto)
        )
                // El GlobalExceptionHandler maneja las RuntimeExceptions (ej: Usuario no encontrado)
                ;
    }

    // --- 7. Ver Historial de Soporte (Solo tickets propios) ---
    @GetMapping("/soporte")
    public Flux<Soporte> obtenerMisSolicitudes(Mono<Authentication> auth) {

        // Obtenemos el ID del usuario actual para buscar solo sus tickets
        return auth.flatMap(authentication ->
                        usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName())
                )
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
        Mono<Long> idUsuarioMono = auth.flatMap(authentication ->
                usuarioService.obtenerIdUsuarioPorNombreUsuario(authentication.getName())
        );

        // 2. Obtener el ID de la moneda
        Mono<Long> idMonedaMono = tipoMonedaRepository.findBySimboloMoneda(dto.getSimboloMoneda())
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Moneda con símbolo '" + dto.getSimboloMoneda() + "' no soportada.")))
                .map(tipoMoneda -> tipoMoneda.getIdMoneda());

        // 3. Combinar ambos y llamar al servicio transaccional
        return Mono.zip(idUsuarioMono, idMonedaMono)
                .flatMap(tuple -> {
                    Long idUsuario = tuple.getT1();
                    Long idMoneda = tuple.getT2();
                    return walletService.crearWalletAdicional(idUsuario, idMoneda);
                })
                .onErrorResume(e -> Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage())));
    }
}
