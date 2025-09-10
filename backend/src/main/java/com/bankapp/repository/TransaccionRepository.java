package com.bankapp.repository;

import com.bankapp.model.Transaccion;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface TransaccionRepository extends ReactiveCrudRepository<Transaccion, Long> {

    // Metodo para encontrar la wallet por id
    @Query("SELECT * FROM transaccion WHERE id_wallet = :idWallet ORDER BY fecha_transaccion DESC")
    Flux<Transaccion> findByIdWallet(Long idWallet);
}