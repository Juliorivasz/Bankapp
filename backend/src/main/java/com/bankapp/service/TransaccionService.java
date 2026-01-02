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
    private final com.bankapp.repository.TipoMonedaRepository tipoMonedaRepository;
    private final NotificacionService notificacionService;

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

                                // Crear notificaciones para ambos usuarios
                                return Mono.zip(debito, credito)
                                    .flatMap(transacciones -> {
                                        // Notificación para el remitente
                                        Mono<Void> notifOrigen = notificacionService.crearNotificacion(
                                            walletOrigen.getIdUsuario(),
                                            "Transferencia Enviada",
                                            String.format("Enviaste %s a %s", monto, nombreDestino),
                                            com.bankapp.model.Enum.TipoNotificacion.INFO
                                        ).then();
                                        
                                        // Notificación para el destinatario
                                        Mono<Void> notifDestino = notificacionService.crearNotificacion(
                                            walletDestino.getIdUsuario(),
                                            "Transferencia Recibida",
                                            String.format("Recibiste %s de %s", monto, nombreOrigen),
                                            com.bankapp.model.Enum.TipoNotificacion.SUCCESS
                                        ).then();
                                        
                                        return Mono.zip(notifOrigen, notifDestino)
                                            .thenReturn(transacciones.getT1());
                                    });
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
    
    // Sobrecarga para usar en depositar/retirar
    private Mono<Transaccion> crearTransaccion(Long idWallet, String numeroCuenta, BigDecimal monto, com.bankapp.model.Enum.TipoTransaccion tipo, EstadoTransaccion estado, String descripcion) {
        return crearTransaccion(idWallet, numeroCuenta, monto, tipo, estado, descripcion, null);
    }

    private Mono<Transaccion> crearTransaccion(String numeroCuenta, BigDecimal monto, EstadoTransaccion estado, String descripcion) {
        return crearTransaccion(null, numeroCuenta, monto, null, estado, descripcion, null);
    }

    /**
     * HISTORIA DE USUARIO: Añadir fondos (Depósito).
     */
    @Transactional
    public Mono<Transaccion> depositar(Long idUsuario, DepositoDTO depositoDTO) {
        if (depositoDTO.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("El monto a depositar debe ser positivo."));
        }

        return walletRepository.findByNumeroCuenta(depositoDTO.getNumeroCuenta())
                .switchIfEmpty(Mono.error(new RuntimeException("Wallet no encontrada para depósito.")))
                .filter(w -> w.getIdUsuario().equals(idUsuario))
                .switchIfEmpty(Mono.error(new SecurityException("Acceso denegado: La wallet no pertenece al usuario.")))
                .flatMap(wallet -> {
                    wallet.setBalance(wallet.getBalance().add(depositoDTO.getMonto()));
                    wallet.setUltimaActualizacion(LocalDateTime.now());

                    return walletRepository.save(wallet)
                            .flatMap(savedWallet -> crearTransaccion(
                                    depositoDTO.getNumeroCuenta(),
                                    depositoDTO.getMonto(),
                                    EstadoTransaccion.EXITO,
                                    "Depósito de fondos externo (Verificado por " + idUsuario + ")"
                            ))
                            .flatMap(transaccion -> 
                                // Crear notificación de depósito
                                notificacionService.crearNotificacion(
                                    idUsuario,
                                    "Depósito Exitoso",
                                    String.format("Se depositaron %s en tu cuenta", depositoDTO.getMonto()),
                                    com.bankapp.model.Enum.TipoNotificacion.SUCCESS
                                ).thenReturn(transaccion)
                            );
                });
    }

    /**
     * HISTORIA DE USUARIO: Retirar fondos.
     */
    @Transactional
    public Mono<Transaccion> retirar(Long idUsuario, RetiroDTO retiroDTO) {
        if (retiroDTO.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("El monto a retirar debe ser positivo."));
        }

        return walletRepository.findByNumeroCuenta(retiroDTO.getNumeroCuenta())
                .switchIfEmpty(Mono.error(new RuntimeException("Wallet no encontrada para retiro.")))
                .filter(w -> w.getIdUsuario().equals(idUsuario))
                .switchIfEmpty(Mono.error(new SecurityException("Acceso denegado: La wallet no pertenece al usuario.")))
                .flatMap(wallet -> {
                    if (wallet.getBalance().compareTo(retiroDTO.getMonto()) < 0) {
                        return Mono.error(new IllegalArgumentException("Fondos insuficientes para el retiro."));
                    }
                    wallet.setBalance(wallet.getBalance().subtract(retiroDTO.getMonto()));
                    wallet.setUltimaActualizacion(LocalDateTime.now());

                    return walletRepository.save(wallet)
                            .flatMap(savedWallet -> crearTransaccion(
                                    retiroDTO.getNumeroCuenta(),
                                    retiroDTO.getMonto().negate(),
                                    EstadoTransaccion.PENDIENTE,
                                    "Retiro a cuenta externa (Verificado por " + idUsuario + ")"
                            ))
                            .flatMap(transaccion -> 
                                // Crear notificación de retiro
                                notificacionService.crearNotificacion(
                                    idUsuario,
                                    "Retiro Procesado",
                                    String.format("Tu retiro de %s está siendo procesado", retiroDTO.getMonto()),
                                    com.bankapp.model.Enum.TipoNotificacion.INFO
                                ).thenReturn(transaccion)
                            );
                });
    }

    /**
     * Realiza un intercambio de divisas entre dos wallets del mismo usuario.
     */
    @Transactional
    public Mono<Transaccion> intercambiar(Long idUsuario, com.bankapp.model.dto.transferencia.IntercambioDTO intercambioDTO) {
        BigDecimal montoOrigen = intercambioDTO.getMontoOrigen();
        BigDecimal tasa = intercambioDTO.getTasaConversion();

        if (montoOrigen == null || montoOrigen.compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("El monto a intercambiar debe ser positivo."));
        }
        if (tasa == null || tasa.compareTo(BigDecimal.ZERO) <= 0) {
            return Mono.error(new IllegalArgumentException("La tasa de conversión debe ser válida."));
        }

        return walletRepository.findByNumeroCuenta(intercambioDTO.getNumeroCuentaOrigen())
            .switchIfEmpty(Mono.error(new RuntimeException("Wallet de origen no encontrada.")))
            .filter(w -> w.getIdUsuario().equals(idUsuario))
            .switchIfEmpty(Mono.error(new SecurityException("Wallet de origen no pertenece al usuario.")))
            .flatMap(walletOrigen -> 
                walletRepository.findByNumeroCuenta(intercambioDTO.getNumeroCuentaDestino())
                    .switchIfEmpty(Mono.error(new RuntimeException("Wallet destino no encontrada.")))
                    .filter(w -> w.getIdUsuario().equals(idUsuario))
                    .switchIfEmpty(Mono.error(new SecurityException("Wallet destino no pertenece al usuario.")))
                    .flatMap(walletDestino -> {
                        
                        if (walletOrigen.getBalance().compareTo(montoOrigen) < 0) {
                            return Mono.error(new IllegalArgumentException("Fondos insuficientes."));
                        }

                        BigDecimal montoDestino = montoOrigen.multiply(tasa); 

                        walletOrigen.setBalance(walletOrigen.getBalance().subtract(montoOrigen));
                        walletDestino.setBalance(walletDestino.getBalance().add(montoDestino));
                        
                        walletOrigen.setUltimaActualizacion(LocalDateTime.now());
                        walletDestino.setUltimaActualizacion(LocalDateTime.now());

                        return Mono.zip(walletRepository.save(walletOrigen), walletRepository.save(walletDestino))
                            .flatMap(tuple -> {
                                
                                Mono<String> symbolOrigenMono = tipoMonedaRepository.findById(walletOrigen.getIdMoneda())
                                    .map(m -> m.getSimboloMoneda())
                                    .defaultIfEmpty("???");
                                    
                                Mono<String> symbolDestinoMono = tipoMonedaRepository.findById(walletDestino.getIdMoneda())
                                    .map(m -> m.getSimboloMoneda())
                                    .defaultIfEmpty("???");

                                return Mono.zip(symbolOrigenMono, symbolDestinoMono)
                                    .flatMap(symbols -> {
                                        String symbolOrigen = symbols.getT1();
                                        String symbolDestino = symbols.getT2();

                                        Mono<Transaccion> debito = crearTransaccion(
                                            walletOrigen.getIdWallet(),
                                            walletOrigen.getNumeroCuenta(),
                                            montoOrigen.negate(),
                                            com.bankapp.model.Enum.TipoTransaccion.TRANSFERENCIA_ENVIADA, 
                                            EstadoTransaccion.EXITO,
                                            "Conversión a " + symbolDestino,
                                            walletDestino.getNumeroCuenta()
                                        );

                                        Mono<Transaccion> credito = crearTransaccion(
                                            walletDestino.getIdWallet(),
                                            walletDestino.getNumeroCuenta(),
                                            montoDestino,
                                            com.bankapp.model.Enum.TipoTransaccion.TRANSFERENCIA_RECIBIDA,
                                            EstadoTransaccion.EXITO,
                                            "Conversión desde " + symbolOrigen,
                                            walletOrigen.getNumeroCuenta()
                                        );

                                        return Mono.zip(debito, credito).map(t -> t.getT1());
                                    });
                            });
                    })
            );
    }

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
            .flatMap(cbu -> walletRepository.findByNumeroCuenta(cbu)
                .flatMap(walletDestino -> Mono.zip(
                        usuarioRepository.findById(walletDestino.getIdUsuario()),
                        tipoMonedaRepository.findById(walletDestino.getIdMoneda())
                ).map(tuple -> {
                    Usuario usuarioDestino = tuple.getT1();
                    var tipoMoneda = tuple.getT2();
                    return new com.bankapp.model.dto.transferencia.DestinatarioDTO(
                        usuarioDestino.getIdUsuario(),
                        usuarioDestino.getNombreUsuario(), 
                        usuarioDestino.getNombreUsuario(), 
                        walletDestino.getNumeroCuenta(),
                        "BankApp",
                        tipoMoneda.getSimboloMoneda()
                    );
                }))
            );
    }
    /**
     * Búsqueda avanzada de transacciones con paginación.
     */
    public Mono<org.springframework.data.domain.Page<Transaccion>> buscarTransacciones(
            Long idUsuario,
            Long idWallet,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin,
            String tipo,
            String busqueda,
            int page,
            int size) {

        // 1. Validar que la wallet pertenece al usuario (si se especifica una)
        Mono<String> numeroCuentaMono;
        if (idWallet != null) {
            numeroCuentaMono = walletRepository.findById(idWallet)
                    .filter(w -> w.getIdUsuario().equals(idUsuario))
                    .switchIfEmpty(Mono.error(new SecurityException("La wallet no pertenece al usuario.")))
                    .map(Wallet::getNumeroCuenta);
        } else {
             // Si no se especifica wallet, ¿buscar en todas? 
             // Por ahora requerimos wallet específica según requerimiento.
             // O podemos soportar null para buscar en todas (requeriría ajustar Repo).
             // Vamos a asumir que el frontend siempre manda idWallet por ahora o implementamos
             // una mejora futura para "Todas".
             // Ajuste: El Repo espera String numeroCuenta. Si es null, busca en TODAS las transacciones
             // lo cual es inseguro (vería transacciones de otros).
             // Así que SI idWallet es null, deberíamos buscar todas las cuentas del usuario.
             // Por simplicidad y requerimiento "individual", lanzamos error si es null o lo manejamos.
             // Vamos a forzar seleccionar una wallet por ahora.
             return Mono.error(new IllegalArgumentException("Debes seleccionar una billetera."));
        }

        return numeroCuentaMono.flatMap(numeroCuenta -> {
            long offset = (long) page * size;
            
            Mono<Long> totalMono = transaccionRepository.countByAdvancedFilters(
                    numeroCuenta, fechaInicio, fechaFin, tipo, busqueda);

            Flux<Transaccion> transaccionesFlux = transaccionRepository.findByAdvancedFilters(
                    numeroCuenta, fechaInicio, fechaFin, tipo, busqueda, size, offset);

            return Mono.zip(transaccionesFlux.collectList(), totalMono)
                    .map(tuple -> new org.springframework.data.domain.PageImpl<>(
                            tuple.getT1(),
                            org.springframework.data.domain.PageRequest.of(page, size),
                            tuple.getT2()
                    ));
        });
    }
}