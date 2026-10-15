package com.finai.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleInvalidRequest(
            HttpMessageNotReadableException ex) {

        log.error("Login/request JSON parsing failed", ex);

        String detail = ex.getMostSpecificCause().getMessage();

        return ResponseEntity.badRequest().body(
                Map.of("error", detail != null ? detail : "Unknown JSON parsing error")
        );
    }


    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex) {
        log.error("Application request failed", ex);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("error", "Request failed. Check backend logs.")
        );
    }
}
