package com.bankapp.repository;

import com.bankapp.model.TipoMoneda;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface TipoMonedaRepository extends ReactiveCrudRepository<TipoMoneda, Long> {
}