package com.bankapp.repository;

import com.bankapp.model.Direccion;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface DireccionRepository extends ReactiveCrudRepository<Direccion, Long> {
}