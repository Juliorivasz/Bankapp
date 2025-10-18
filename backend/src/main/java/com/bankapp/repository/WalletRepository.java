package com.bankapp.repository;

import com.bankapp.model.Wallet;
import com.bankapp.model.dto.reporte.BalanceGlobalDTO;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface WalletRepository extends ReactiveCrudRepository<Wallet, Long> {

    Flux<Wallet> findByIdUsuario(Long idUsuario);

    Mono<Wallet> findByIdUsuarioAndIdMoneda(Long idUsuario, Long idMoneda);

    Mono<Wallet> findByNumeroCuenta(String numeroCuenta);

    /**
     * Utiliza una consulta nativa para sumar los balances y agruparlos por moneda.
     * NOTA: La R2DBC espera que los resultados coincidan con los campos del DTO.
     */
    @Query("SELECT id_moneda, SUM(balance) AS saldo_total FROM wallet GROUP BY id_moneda")
    Flux<BalanceGlobalDTO> findTotalBalanceGroupedByMoneda();

}