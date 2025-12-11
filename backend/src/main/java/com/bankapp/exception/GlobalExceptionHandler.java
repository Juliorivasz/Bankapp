package com.bankapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Metodo auxiliar para construir la respuesta de error JSON
    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message, String errorType) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", status.value());
        errorDetails.put("error", errorType);
        errorDetails.put("message", message);
        return new ResponseEntity<>(errorDetails, status);
    }

    // --- 400 Bad Request (Reglas de Negocio / Validaciones fallidas) ---
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        // Captura: Fondos insuficientes, Monedas/Usuario ya existen, Monto negativo
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "Bad Request / Validation Failed");
    }

    // --- 404 Not Found (Recurso no encontrado) ---
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(RuntimeException ex) {
        // Captura RuntimeException que lanzamos por recursos críticos no encontrados (Rol, Wallet, País)
        if (ex.getMessage() != null && ex.getMessage().contains("no encontrado")) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "Resource Not Found");
        }
        // Si no contiene "no encontrado", se trata como un error interno.
        return handleGenericInternalError(ex);
    }

    // --- 403 Forbidden (Autorización de Propiedad / Acceso Denegado) ---
    @ExceptionHandler({SecurityException.class, AccessDeniedException.class})
    public ResponseEntity<Map<String, Object>> handleForbiddenAccess(Exception ex) {
        // Captura: SecurityException (lanzada en TransaccionService por IDOR), AccessDeniedException (@PreAuthorize fail)
        String message = ex.getMessage() != null ? ex.getMessage() : "Acceso Prohibido. No tiene permisos sobre este recurso.";
        return buildErrorResponse(HttpStatus.FORBIDDEN, message, "Forbidden / Access Denied");
    }

    // --- 500 Internal Server Error (Genérico) ---
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericInternalError(Exception ex) {
        System.err.println("CRITICAL ERROR: " + ex.getClass().getName() + " - " + ex.getMessage());
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ha ocurrido un error inesperado en el servidor.",
                "Internal Server Error");
    }

}
