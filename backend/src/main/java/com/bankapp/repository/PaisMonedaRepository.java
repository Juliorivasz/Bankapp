package com.bankapp.repository;
import com.bankapp.model.PaisMoneda;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface PaisMonedaRepository extends ReactiveCrudRepository<PaisMoneda, Long> {
    Flux<PaisMoneda> findByIdPais(Long idPais);
    Flux<PaisMoneda> findByIdPaisAndEsPrincipalIsTrue(Long idPais);
}