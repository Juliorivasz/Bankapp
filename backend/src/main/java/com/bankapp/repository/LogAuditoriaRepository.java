package com.bankapp.repository;

import com.bankapp.model.LogAuditoria;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface LogAuditoriaRepository extends ReactiveCrudRepository<LogAuditoria, Long> {
}