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
}