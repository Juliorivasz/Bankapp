package com.bankapp.service;

import com.bankapp.model.Enum.EstadoTransaccion;
import com.bankapp.model.Transaccion;
import com.bankapp.model.Usuario;
import com.bankapp.model.Wallet;
import com.bankapp.model.dto.transferencia.DepositoDTO;
import com.bankapp.model.dto.transferencia.RetiroDTO;
import com.bankapp.model.dto.transferencia.TransferenciaDTO;
import com.bankapp.repository.TransaccionRepository;
import com.bankapp.repository.UsuarioRepository;
import com.bankapp.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransaccionService {

    private final UsuarioRepository usuarioRepository;
    private final WalletRepository walletRepository;
    private final TransaccionRepository transaccionRepository;

    /**
     * Implementa la lógica de partida doble: debita al origen y acredita al destino.
     * @param idUsuarioOrigen ID del usuario que inicia la transferencia (para validación).
     * @param transferenciaDTO Datos de la transferencia (idWalletOrigen, destino, monto).
     * @return El Mono de la transacción de débito registrada.
     */
    @Transactional
    public Mono<Transaccion> enviarDinero(Long idUsuarioOrigen, TransferenciaDTO transferenciaDTO) {

        BigDecimal monto = transferenciaDTO.getMonto();

        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("El monto debe ser positivo."));
        }

        // 1. Obtener la Wallet de Origen
        Mono<Wallet> origenMono = walletRepository.findByNumeroCuenta(transferenciaDTO.getNumeroCuentaOrigen())
                .switchIfEmpty(Mono.error(new RuntimeException("Wallet de origen no encontrada.")))
                .filter(w -> w.getIdUsuario().equals(idUsuarioOrigen)) // Seguridad: Wallet debe pertenecer al usuario
                .switchIfEmpty(Mono.error(new SecurityException("Acceso denegado: Wallet no pertenece al usuario.")));

        return origenMono.flatMap(walletOrigen -> {
            // Validar saldo
            if (walletOrigen.getBalance().compareTo(monto) < 0) {
                return Mono.error(new IllegalArgumentException("Fondos insuficientes."));
            }

            // 2. Determinar Wallet Destino
            // Estrategia: 
            // A. Si el destino parece un numero de cuenta (CBU), buscar Wallet directamente.
            // B. Si no, buscar Usuario (Alias/Email) y luego su wallet en la misma moneda.
            
            String destinoInput = transferenciaDTO.getDestino();
            
            return resolveWalletDestino(destinoInput, walletOrigen.getIdMoneda())
                .flatMap(walletDestino -> {
                    
                    // Validaciones finales
                    if (walletOrigen.getIdUsuario().equals(walletDestino.getIdUsuario())) {
                        return Mono.error(new IllegalArgumentException("No puedes enviar dinero a tu propia cuenta (mismo usuario)."));
                    }
                    if (!walletOrigen.getIdMoneda().equals(walletDestino.getIdMoneda())) {
                         return Mono.error(new IllegalArgumentException("La cuenta destino no es de la misma moneda."));
                    }

                    // 3. Ejecutar Transferencia
                    walletOrigen.setBalance(walletOrigen.getBalance().subtract(monto));
                    walletDestino.setBalance(walletDestino.getBalance().add(monto));
                    walletOrigen.setUltimaActualizacion(LocalDateTime.now());
                    walletDestino.setUltimaActualizacion(LocalDateTime.now());

                    return Mono.zip(walletRepository.save(walletOrigen), walletRepository.save(walletDestino))
                        .flatMap(tuple -> {
                            // Obtener nombres para descripcion
                            Mono<String> nombreOrigenMono = usuarioRepository.findById(walletOrigen.getIdUsuario())
                                    .map(Usuario::getNombreUsuario).defaultIfEmpty("Desconocido");
                            Mono<String> nombreDestinoMono = usuarioRepository.findById(walletDestino.getIdUsuario())
                                    .map(Usuario::getNombreUsuario).defaultIfEmpty("Desconocido");

                            return Mono.zip(nombreOrigenMono, nombreDestinoMono).flatMap(nombres -> {
                                String nombreOrigen = nombres.getT1();
                                String nombreDestino = nombres.getT2();

                                // Crear transacciones con Enum
                                Mono<Transaccion> debito = crearTransaccion(
                                        walletOrigen.getIdWallet(),
                                        walletOrigen.getNumeroCuenta(),
                                        monto.negate(),
                                        com.bankapp.model.Enum.TipoTransaccion.TRANSFERENCIA_ENVIADA,
                                        EstadoTransaccion.EXITO,
                                        "Envío a " + nombreDestino,
                                        walletDestino.getNumeroCuenta() // <--- Cuenta Destino REAL
                                );

                                Mono<Transaccion> credito = crearTransaccion(
                                        walletDestino.getIdWallet(),
                                        walletDestino.getNumeroCuenta(),
                                        monto,
                                        com.bankapp.model.Enum.TipoTransaccion.TRANSFERENCIA_RECIBIDA,
                                        EstadoTransaccion.EXITO,
                                        "Recibido de " + nombreOrigen,
                                        walletOrigen.getNumeroCuenta() // <--- Cuenta Origen (Para referencia inversa)
                                );

                                // FIX: Usar zip para suscribirse una sola vez a ambos y retornar el debito.
                                // Mono.when(debito, credito).then(debito) causaba doble suscripción a 'debito'.
                                return Mono.zip(debito, credito).map(result -> result.getT1());
                            });
                        });
                });
        });
    }

    /**
     * Resuelve la wallet de destino buscando por CBU (numeroCuenta) o Alias (Usuario).
     */
    private Mono<Wallet> resolveWalletDestino(String input, Long idMonedaRequerida) {
        // Opción A: Buscar por CBU (Numero Cuenta)
        return walletRepository.findByNumeroCuenta(input)
                .switchIfEmpty(
                    // Opción B: Si no es CBU, buscar Usuario por Email o Alias
                    usuarioRepository.findByEmail(input)
                        .switchIfEmpty(usuarioRepository.findByNombreUsuario(input))
                        .flatMap(usuario -> 
                            // Buscar wallet del usuario en la moneda requerida
                            walletRepository.findByIdUsuarioAndIdMoneda(usuario.getIdUsuario(), idMonedaRequerida)
                                .switchIfEmpty(Mono.error(new RuntimeException("El usuario destino '" + input + "' no tiene cuenta en esta moneda.")))
                        )
                )
                .switchIfEmpty(Mono.error(new RuntimeException("Destinatario no encontrado (ni CBU, ni Alias/Email).")));
    }

    /**
     * Busca todas las transacciones de una wallet específica (ingresos y egresos).
     */
    public Flux<Transaccion> verHistorial(String numeroCuenta) {
        return transaccionRepository.findByNumeroCuenta(numeroCuenta);
    }

    // -------------------------------------------------------------------------------
    // Métodos Auxiliares
    // --------------------------------------------------------------------------------

    private Mono<Transaccion> crearTransaccion(Long idWallet, String numeroCuenta, BigDecimal monto, com.bankapp.model.Enum.TipoTransaccion tipo, EstadoTransaccion estado, String descripcion, String cuentaDestino) {
        Transaccion transaccion = new Transaccion();
        transaccion.setIdWallet(idWallet);
        transaccion.setNumeroCuenta(numeroCuenta);
        transaccion.setMonto(monto);
        transaccion.setTipoTransaccion(tipo != null ? tipo.name() : null);
        transaccion.setEstadoTransaccion(estado);
        transaccion.setFechaTransaccion(LocalDateTime.now());
        transaccion.setDescripcion(descripcion);
        transaccion.setCuentaDestino(cuentaDestino);
        return transaccionRepository.save(transaccion);
    }
    
    // Sobrecarga para usar en depositar/retirar (cuentaDestino = null)
    private Mono<Transaccion> crearTransaccion(Long idWallet, String numeroCuenta, BigDecimal monto, com.bankapp.model.Enum.TipoTransaccion tipo, EstadoTransaccion estado, String descripcion) {
        return crearTransaccion(idWallet, numeroCuenta, monto, tipo, estado, descripcion, null);
    }

    private Mono<Transaccion> crearTransaccion(String numeroCuenta, BigDecimal monto, EstadoTransaccion estado, String descripcion) {
        return crearTransaccion(null, numeroCuenta, monto, null, estado, descripcion, null);
    }

    /**
     * HISTORIA DE USUARIO: Añadir fondos (Depósito).
     * @param idUsuario ID del usuario autenticado (NUEVO)
     * @param depositoDTO a depositar.
     */
    @Transactional
    public Mono<Transaccion> depositar(Long idUsuario, DepositoDTO depositoDTO) {
        if (depositoDTO.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("El monto a depositar debe ser positivo."));
        }

        return walletRepository.findByNumeroCuenta(depositoDTO.getNumeroCuenta())
                .switchIfEmpty(Mono.error(new RuntimeException("Wallet no encontrada para depósito.")))
                // VALIDACIÓN DE PROPIEDAD: Solo permite la acción si la wallet es del usuario autenticado
                .filter(w -> w.getIdUsuario().equals(idUsuario))
                .switchIfEmpty(Mono.error(new SecurityException("Acceso denegado: La wallet no pertenece al usuario."))) // 403 Forbidden
                .flatMap(wallet -> {
                    // ... (resto de la lógica de actualización y guardado de wallet) ...
                    wallet.setBalance(wallet.getBalance().add(depositoDTO.getMonto()));
                    wallet.setUltimaActualizacion(LocalDateTime.now());

                    return walletRepository.save(wallet)
                            .flatMap(savedWallet -> crearTransaccion(
                                    depositoDTO.getNumeroCuenta(),
                                    depositoDTO.getMonto(),
                                    EstadoTransaccion.EXITO,
                                    "Depósito de fondos externo (Verificado por " + idUsuario + ")"
                            ));
                });
    }

    /**
     * HISTORIA DE USUARIO: Retirar fondos.
     * @param idUsuario ID del usuario autenticado (NUEVO)
     * @param retiroDTO dto de la wallet a retirar.
     */
    @Transactional
    public Mono<Transaccion> retirar(Long idUsuario, RetiroDTO retiroDTO) {
        if (retiroDTO.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("El monto a retirar debe ser positivo."));
        }

        return walletRepository.findByNumeroCuenta(retiroDTO.getNumeroCuenta())
                .switchIfEmpty(Mono.error(new RuntimeException("Wallet no encontrada para retiro.")))
                // VALIDACIÓN DE PROPIEDAD: Solo permite la acción si la wallet es del usuario autenticado
                .filter(w -> w.getIdUsuario().equals(idUsuario))
                .switchIfEmpty(Mono.error(new SecurityException("Acceso denegado: La wallet no pertenece al usuario."))) // 403 Forbidden
                .flatMap(wallet -> {
                    // ... (resto de la lógica de validación de balance y retiro) ...

                    if (wallet.getBalance().compareTo(retiroDTO.getMonto()) < 0) {
                        return Mono.error(new IllegalArgumentException("Fondos insuficientes para el retiro."));
                    }

                    // ... (Actualización de balance y guardado de transaccion) ...
                    wallet.setBalance(wallet.getBalance().subtract(retiroDTO.getMonto()));
                    wallet.setUltimaActualizacion(LocalDateTime.now());

                    return walletRepository.save(wallet)
                            .flatMap(savedWallet -> crearTransaccion(
                                    retiroDTO.getNumeroCuenta(),
                                    retiroDTO.getMonto().negate(),
                                    EstadoTransaccion.PENDIENTE,
                                    "Retiro a cuenta externa (Verificado por " + idUsuario + ")"
                            ));
                });
    }

    /**
     * Obtiene los destinatarios recientes de transferencias realizadas por el usuario.
     */
    public Flux<com.bankapp.model.dto.transferencia.DestinatarioDTO> obtenerDestinatariosRecientes(Long idUsuario) {
        return walletRepository.findByIdUsuario(idUsuario)
            .map(Wallet::getNumeroCuenta)
            .collectList()
            .flatMapMany(numerosCuenta -> {
                if (numerosCuenta.isEmpty()) {
                    return Flux.empty();
                }
                return transaccionRepository.findDistinctCuentaDestinoByNumeroCuentaIn(numerosCuenta);
            })
            // Para cada CBU destino, recuperamos la info del usuario y cuenta
            .flatMap(cbu -> walletRepository.findByNumeroCuenta(cbu)
                .flatMap(walletDestino -> usuarioRepository.findById(walletDestino.getIdUsuario())
                    .map(usuarioDestino -> new com.bankapp.model.dto.transferencia.DestinatarioDTO(
                        usuarioDestino.getIdUsuario(),
                        usuarioDestino.getNombreUsuario(), // Alias / Nombre
                        usuarioDestino.getNombreUsuario(), // Nombre completo (usamos username por ahora)
                        walletDestino.getNumeroCuenta(),
                        "BankApp"
                    ))
                )
            );
    }
}