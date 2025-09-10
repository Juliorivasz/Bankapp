package com.bankapp.repository;

import com.bankapp.model.Documento;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface DocumentoRepository extends ReactiveCrudRepository<Documento, Long> {
}