package com.bankapp.repository;

import com.bankapp.model.Soporte;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface SoporteRepository extends ReactiveCrudRepository<Soporte, Long> {
}