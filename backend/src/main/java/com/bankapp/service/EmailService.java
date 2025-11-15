package com.bankapp.service;

import com.bankapp.model.Usuario;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // URL base de tu backend (para construir el enlace)
    private static final String BASE_URL = "http://localhost:5173/verificar?token=";

    /**
     * Envía el correo de verificación de forma no bloqueante.
     */
    public Mono<Void> enviarCorreoVerificacion(Usuario usuario, String verificationToken) {

        // 1. Ejecutar el código BLOQUEANTE (JavaMailSender) en un Scheduler dedicado
        return Mono.fromRunnable(() -> {
                    try {
                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                        helper.setTo(usuario.getEmail());
                        helper.setSubject("Verifica tu Cuenta BankApp");
                        helper.setFrom("soporte@bankapp.com");

                        String verificationLink = BASE_URL + verificationToken;
                        String htmlContent = buildHtmlEmail(usuario.getNombreUsuario(), verificationLink); // Usaría una plantilla Thymeleaf

                        helper.setText(htmlContent, true); // True indica que es contenido HTML

                        mailSender.send(message);

                        System.out.println("✅ Email de verificación enviado a: " + usuario.getEmail());

                    } catch (Exception e) {
                        System.err.println("❌ Error al enviar email: " + e.getMessage());
                        // En un caso real, podrías registrar o reintentar el error
                    }
                })
                // 2. Ejecutar la tarea en un hilo que no sea el hilo principal reactivo
                .subscribeOn(Schedulers.boundedElastic())
                .then(); // Devolver Mono<Void> indicando que la operación terminó
    }

    // Lógica para construir el email (Aquí iría la integración con Thymeleaf)
    private String buildHtmlEmail(String username, String link) {
        return "<html><body><h1>Hola, " + username + "!</h1>"
                + "<p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>"
                + "<p><a href=\"" + link + "\">Verificar Cuenta</a></p>"
                + "<p>El enlace expirará en 24 horas.</p>"
                + "</body></html>";
    }
}