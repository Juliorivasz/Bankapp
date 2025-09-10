package com.bankapp.repository;

import com.bankapp.model.Wallet;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface WalletRepository extends ReactiveCrudRepository<Wallet, Long> {

    Flux<Wallet> findByIdUsuario(Long idUsuario);

}