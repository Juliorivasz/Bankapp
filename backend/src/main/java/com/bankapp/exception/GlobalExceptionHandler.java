package com.bankapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", HttpStatus.BAD_REQUEST.value());
        errorDetails.put("error", "Bad Request");
        errorDetails.put("message", ex.getMessage());

        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }
//
//    @ExceptionHandler(RuntimeException.class)
//    public ResponseEntity<Map<String, Object>> handleNotFoundException(RuntimeException ex) {
//        // Podrías refinar esta lógica para capturar solo las excepciones que indican NOT_FOUND
//        if (ex.getMessage() != null && ex.getMessage().contains("no encontrado")) {
//            Map<String, Object> errorDetails = new HashMap<>();
//            errorDetails.put("timestamp", LocalDateTime.now());
//            errorDetails.put("status", HttpStatus.NOT_FOUND.value());
//            errorDetails.put("error", "Not Found");
//            errorDetails.put("message", ex.getMessage());
//
//            return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
//        }
//
//        // Si no es un error "Not Found" conocido, se puede devolver un 500
//        Map<String, Object> errorDetails = new HashMap<>();
//        errorDetails.put("timestamp", LocalDateTime.now());
//        errorDetails.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
//        errorDetails.put("error", "Internal Server Error");
//        errorDetails.put("message", "Ha ocurrido un error inesperado.");
//
//        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
//    }

}
