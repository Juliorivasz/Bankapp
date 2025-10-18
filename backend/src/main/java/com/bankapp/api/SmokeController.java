// java
package com.bankapp.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class SmokeController {
    @GetMapping("/ping")
    public Mono<String> ping() {
        return Mono.just("pong");
    }
}