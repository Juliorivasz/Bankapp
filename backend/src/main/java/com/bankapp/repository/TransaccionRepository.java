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

    // Búsqueda avanzada con filtros y paginación
    @Query("SELECT * FROM transaccion t WHERE " +
           "(:numeroCuenta IS NULL OR t.numero_cuenta = :numeroCuenta) AND " +
           "(:fechaInicio IS NULL OR t.fecha_transaccion >= :fechaInicio) AND " +
           "(:fechaFin IS NULL OR t.fecha_transaccion <= :fechaFin) AND " +
           "(:tipo IS NULL OR t.tipo_transaccion = :tipo) AND " +
           "(:busqueda IS NULL OR (LOWER(t.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR CAST(t.monto AS CHAR) LIKE CONCAT('%', :busqueda, '%'))) " +
           "ORDER BY t.fecha_transaccion DESC LIMIT :limit OFFSET :offset")
    Flux<Transaccion> findByAdvancedFilters(
            String numeroCuenta,
            java.time.LocalDateTime fechaInicio,
            java.time.LocalDateTime fechaFin,
            String tipo,
            String busqueda,
            int limit,
            long offset
    );

    // Contar total para paginación con los mismos filtros
    @Query("SELECT COUNT(*) FROM transaccion t WHERE " +
           "(:numeroCuenta IS NULL OR t.numero_cuenta = :numeroCuenta) AND " +
           "(:fechaInicio IS NULL OR t.fecha_transaccion >= :fechaInicio) AND " +
           "(:fechaFin IS NULL OR t.fecha_transaccion <= :fechaFin) AND " +
           "(:tipo IS NULL OR t.tipo_transaccion = :tipo) AND " +
           "(:busqueda IS NULL OR (LOWER(t.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR CAST(t.monto AS CHAR) LIKE CONCAT('%', :busqueda, '%')))")
    Mono<Long> countByAdvancedFilters(
            String numeroCuenta,
            java.time.LocalDateTime fechaInicio,
            java.time.LocalDateTime fechaFin,
            String tipo,
            String busqueda
    );
}
