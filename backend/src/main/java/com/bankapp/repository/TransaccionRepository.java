package com.bankapp.repository;

import com.bankapp.model.Transaccion;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

public interface TransaccionRepository extends ReactiveCrudRepository<Transaccion, Long> {

    // Metodo para encontrar la wallet por id
    @Query("SELECT * FROM transaccion WHERE id_wallet = :idWallet ORDER BY fecha_transaccion DESC")
    Flux<Transaccion> findByIdWallet(Long idWallet);

    Mono<Long> countByEstadoTransaccion(String estado);

    @Query("SELECT SUM(monto) FROM transaccion WHERE estado_transaccion = :estado")
    Mono<BigDecimal> sumMontoByEstadoTransaccion(String estado);

    Flux<Transaccion> findByNumeroCuenta(String numeroCuenta);

    @Query("SELECT * FROM transaccion WHERE numero_cuenta = :numeroCuenta AND fecha_transaccion >= :desde ORDER BY fecha_transaccion ASC")
    Flux<Transaccion> findByNumeroCuentaAndFechaTransaccionAfterOrderByFechaTransaccionAsc(String numeroCuenta,
            java.time.LocalDateTime desde);

    Flux<Transaccion> findByNumeroCuentaInAndFechaTransaccionAfterOrderByFechaTransaccionDesc(java.util.List<String> numerosCuenta, java.time.LocalDateTime desde);
    
    Flux<Transaccion> findByNumeroCuentaInAndFechaTransaccionAfterOrderByFechaTransaccionAsc(java.util.List<String> numerosCuenta, java.time.LocalDateTime desde);

    @Query("SELECT DISTINCT cuenta_destino FROM transaccion WHERE numero_cuenta IN (:numerosCuenta) AND tipo_transaccion = 'TRANSFERENCIA_ENVIADA' AND cuenta_destino IS NOT NULL LIMIT 20")
    Flux<String> findDistinctCuentaDestinoByNumeroCuentaIn(java.util.List<String> numerosCuenta);
}
