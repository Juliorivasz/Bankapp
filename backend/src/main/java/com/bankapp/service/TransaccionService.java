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

        // 2. Encontrar el Usuario Destino por email/username
        Mono<Usuario> destinoMono = usuarioRepository.findByEmail(transferenciaDTO.getDestino())
                .switchIfEmpty(usuarioRepository.findByNombreUsuario(transferenciaDTO.getDestino())) // Intenta por username si no es email
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario de destino no encontrado.")));

        // Combina la Wallet Origen y el Usuario Destino
        return Mono.zip(origenMono, destinoMono)
                .flatMap(tuple -> {
                    Wallet walletOrigen = tuple.getT1();
                    Usuario usuarioDestino = tuple.getT2();

                    // Validaciones adicionales
                    if (walletOrigen.getIdUsuario().equals(usuarioDestino.getIdUsuario())) {
                        return Mono.error(new IllegalArgumentException("No puedes enviar dinero a tu propia cuenta."));
                    }
                    if (walletOrigen.getBalance().compareTo(monto) < 0) {
                        return Mono.error(new IllegalArgumentException("Fondos insuficientes."));
                    }

                    // 3. Obtener la Wallet Destino (debe ser la misma moneda)
                    return walletRepository.findByIdUsuarioAndIdMoneda(usuarioDestino.getIdUsuario(), walletOrigen.getIdMoneda())
                            .switchIfEmpty(Mono.error(new RuntimeException("El usuario de destino no tiene una wallet para esta moneda.")))
                            .flatMap(walletDestino -> {

                                // 4. Actualizar Balances
                                walletOrigen.setBalance(walletOrigen.getBalance().subtract(monto));
                                walletDestino.setBalance(walletDestino.getBalance().add(monto));
                                walletOrigen.setUltimaActualizacion(LocalDateTime.now());
                                walletDestino.setUltimaActualizacion(LocalDateTime.now());

                                // 5. Guardar Wallets y registrar las Transacciones
                                return Mono.zip(
                                                walletRepository.save(walletOrigen),
                                                walletRepository.save(walletDestino)
                                        )
                                        .flatMap(savedWallets -> {
                                            // Crear Mono reactivo para obtener el nombre del usuario de origen
                                            return usuarioRepository.findById(idUsuarioOrigen)
                                                    .map(Usuario::getNombreUsuario)
                                                    .defaultIfEmpty("Usuario Desconocido")
                                                    .flatMap(nombreOrigen -> {
                                                        // 6. CREACIÓN DE TRANSACCIÓN DÉBITO
                                                        Mono<Transaccion> debito = crearTransaccion(
                                                                walletOrigen.getNumeroCuenta(),
                                                                monto.negate(),
                                                                EstadoTransaccion.EXITO,
                                                                "Envío a " + usuarioDestino.getNombreUsuario()
                                                        ).cache();

                                                        // 7. CREACIÓN DE TRANSACCIÓN CRÉDITO
                                                        Mono<Transaccion> credito = crearTransaccion(
                                                                walletDestino.getNumeroCuenta(),
                                                                monto,
                                                                EstadoTransaccion.EXITO,
                                                                "Recibido de " + nombreOrigen
                                                        ).cache();

                                                        // Esperar a que ambas transacciones se registren
                                                        return Mono.when(debito, credito).then(debito);
                                                    });
                                        });
                            });
                });
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

    private Mono<Transaccion> crearTransaccion(String numeroCuenta, BigDecimal monto, EstadoTransaccion estado, String descripcion) {
        Transaccion transaccion = new Transaccion();
        transaccion.setNumeroCuenta(numeroCuenta);
        transaccion.setMonto(monto);
        transaccion.setEstadoTransaccion(estado);
        transaccion.setFechaTransaccion(LocalDateTime.now());
        transaccion.setDescripcion(descripcion);
        return transaccionRepository.save(transaccion);
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
                    return walletRepository.save(wallet)
                            .flatMap(savedWallet -> crearTransaccion(
                                    retiroDTO.getNumeroCuenta(),
                                    retiroDTO.getMonto().negate(),
                                    EstadoTransaccion.PENDIENTE,
                                    "Retiro a cuenta externa (Verificado por " + idUsuario + ")"
                            ));
                });
    }
}