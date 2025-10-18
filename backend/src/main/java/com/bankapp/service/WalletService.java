package com.bankapp.service;

import com.bankapp.model.Enum.EstadoCuenta;
import com.bankapp.model.Wallet;
import com.bankapp.model.HistorialEstadoWallet;
import com.bankapp.repository.HistorialEstadoWalletRepository;
import com.bankapp.repository.WalletRepository;
import com.bankapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    // Inyección de dependencias usando @RequiredArgsConstructor
    private final WalletRepository walletRepository;
    private final HistorialEstadoWalletRepository historialEstadoWalletRepository;
    private final UsuarioRepository usuarioRepository; // Añadido para verificar el ID del administrador

    // --------------------------------------------------------------------------------
    // 1. Lógica de Gestión de Estado (Modo Admin)
    // --------------------------------------------------------------------------------

    /**
     * @param idWallet ID de la wallet a actualizar.
     * @param nuevoEstado El nuevo estado deseado (Enum).
     * @param idAdministrador ID del usuario que realiza la acción (para auditoría).
     * @return Mono que emite la Wallet actualizada.
     */
    @Transactional
    public Mono<Wallet> actualizarEstadoWallet(Long idWallet, EstadoCuenta nuevoEstado, Long idAdministrador) {

        // **Validación de auditoría:** Asegurar que el administrador existe
        Mono<Boolean> adminExists = usuarioRepository.findById(idAdministrador).hasElement();

        return adminExists
                .flatMap(exists -> {
                    if (!exists) {
                        return Mono.error(new RuntimeException("El ID de administrador para auditoría no es válido."));
                    }

                    return walletRepository.findById(idWallet)
                            .switchIfEmpty(Mono.error(new RuntimeException("Wallet no encontrada para actualizar estado.")))
                            .flatMap(wallet -> {
                                String estadoAnterior = wallet.getEstadoWallet();
                                String estadoNuevoStr = nuevoEstado.name();

                                // Evitar guardar si no hay cambio de estado
                                if (estadoAnterior.equals(estadoNuevoStr)) {
                                    return Mono.just(wallet);
                                }

                                // 1. Preparar la Wallet para guardar
                                wallet.setEstadoWallet(estadoNuevoStr);
                                wallet.setUltimaActualizacion(LocalDateTime.now());

                                // 2. Preparar el registro de auditoría
                                HistorialEstadoWallet historial = new HistorialEstadoWallet();
                                historial.setIdWallet(idWallet);
                                historial.setEstadoAnterior(estadoAnterior);
                                historial.setEstadoNuevo(estadoNuevoStr);
                                historial.setFechaCambio(LocalDateTime.now());
                                historial.setIdAdministrador(idAdministrador);

                                // 3. Guardar el Historial y luego la Wallet (transaccional)
                                return historialEstadoWalletRepository.save(historial)
                                        .then(walletRepository.save(wallet));
                            });
                });
    }

    // --------------------------------------------------------------------------------
    // 2. Lógica de Creación (Usado por UsuarioService)
    // --------------------------------------------------------------------------------

    /**
     * Crea una nueva wallet con balance cero para un usuario.
     * @param idUsuario ID del usuario.
     * @param idMoneda ID de la moneda.
     * @return Mono que emite la Wallet guardada.
     */
    public Mono<Wallet> crearWalletInicial(Long idUsuario, Long idMoneda) {
        LocalDateTime now = LocalDateTime.now();

        Wallet wallet = new Wallet();
        wallet.setIdUsuario(idUsuario);
        wallet.setIdMoneda(idMoneda);
        wallet.setNumeroCuenta(UUID.randomUUID().toString());
        wallet.setBalance(new BigDecimal("0.00"));
        wallet.setEstadoWallet(EstadoCuenta.ACTIVA.name());
        wallet.setFechaCreacion(now);
        wallet.setUltimaActualizacion(now);

        return walletRepository.save(wallet);
    }

    public Flux<Wallet> verBalancePorNombreUsuario(String username) {
        return usuarioRepository.findByNombreUsuario(username)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario autenticado no encontrado.")))
                .flatMapMany(usuario -> walletRepository.findByIdUsuario(usuario.getIdUsuario()));
    }

    /**
     * Permite a un usuario crear una wallet para una moneda que aún no tiene.
     */
    @Transactional
    public Mono<Wallet> crearWalletAdicional(Long idUsuario, Long idMoneda) {
        // 1. Validar que la wallet no exista ya
        Mono<Boolean> existsMono = walletRepository.findByIdUsuarioAndIdMoneda(idUsuario, idMoneda).hasElement();

        return existsMono.flatMap(exists -> {
            if (exists) {
                return Mono.error(new IllegalArgumentException("El usuario ya tiene una wallet para esta moneda."));
            }

            // 2. Crear la wallet si no existe
            return crearWalletInicial(idUsuario, idMoneda);
        });
    }
}