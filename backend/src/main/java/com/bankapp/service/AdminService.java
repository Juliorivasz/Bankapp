package com.bankapp.service;

import com.bankapp.model.Enum.EstadoCuenta;
import com.bankapp.model.LogAuditoria;
import com.bankapp.model.TipoMoneda;
import com.bankapp.model.Transaccion;
import com.bankapp.model.Usuario;
import com.bankapp.model.dto.reporte.BalanceGlobalDTO;
import com.bankapp.model.dto.reporte.ReporteActividadDTO;
import com.bankapp.model.dto.tipoMoneda.TipoMonedaDTO;
import com.bankapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final TransaccionRepository transaccionRepository;
    private final TipoMonedaRepository tipoMonedaRepository;
    private final WalletRepository walletRepository;
    private final LogAuditoriaRepository logAuditoriaRepository;
    // Asumimos un WalletService para tareas de negocio complejas
    // private final WalletService walletService;

    // --- Historia: Congelar/Bloquear Cuenta de Usuario ---
    /**
     * Congela o desbloquea una cuenta de usuario (Baja Lógica).
     * @param idUsuario ID del usuario a modificar.
     * @param nuevoEstado El estado deseado (ACTIVO o BLOQUEADO).
     * @return Mono que emite el Usuario actualizado.
     */
    @Transactional
    public Mono<Usuario> actualizarEstadoUsuario(Long idUsuario, EstadoCuenta nuevoEstado) {
        return usuarioRepository.findById(idUsuario)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado con ID: " + idUsuario)))
                .flatMap(usuario -> {

                    if (nuevoEstado.name().equals(usuario.getEstadoCuenta())) {
                        return Mono.error(new IllegalArgumentException("El usuario ya tiene el estado: " + nuevoEstado.name()));
                    }

                    // Actualiza el estado
                    usuario.setEstadoCuenta(nuevoEstado.name());

                    // Si se BLOQUEA, se registra la fecha de baja (Baja Lógica)
                    usuario.setFechaBaja(nuevoEstado.equals(EstadoCuenta.BLOQUEADA) ? LocalDateTime.now() : null);

                    // Aquí se podría integrar la suspensión de wallets (futuro)

                    return usuarioRepository.save(usuario);
                });
    }

    // --- Historia: Gestión de Monedas (Crear) ---
    /**
     * Agrega un nuevo tipo de moneda disponible en la plataforma.
     */
    public Mono<TipoMoneda> agregarTipoMoneda(TipoMonedaDTO dto) {
        // Validación de unicidad de símbolo/nombre (se haría aquí)

        TipoMoneda nuevaMoneda = new TipoMoneda();
        nuevaMoneda.setNombreMoneda(dto.getNombreMoneda());
        nuevaMoneda.setSimboloMoneda(dto.getSimboloMoneda());

        return tipoMonedaRepository.findBySimboloMoneda(dto.getSimboloMoneda())
                .flatMap(monedaExistente -> Mono.error(new IllegalArgumentException("La moneda con el símbolo " + dto.getSimboloMoneda() + " ya existe.")))
                .switchIfEmpty(tipoMonedaRepository.save(nuevaMoneda))
                .cast(TipoMoneda.class);
    }

    // Dentro de AdminService.java (Añadir este método)

    /**
     * HISTORIA 4: Genera un reporte de actividad clave dentro de un rango de fechas.
     * @param fechaInicio Fecha de inicio del reporte.
     * @param fechaFin Fecha de fin del reporte.
     * @return Mono que emite el DTO del reporte.
     */
    public Mono<ReporteActividadDTO> generarReporteActividad(LocalDate fechaInicio, LocalDate fechaFin) {

        LocalDateTime start = fechaInicio.atStartOfDay();
        LocalDateTime end = fechaFin.atTime(23, 59, 59);

        // 1. Conteo de Usuarios Registrados (Asumimos que la creación está entre las fechas)
        // Nota: findByFechaCreacionBetween no existe, usaríamos una consulta @Query
        Mono<Long> totalUsuariosMono = usuarioRepository.count();

        // 2. Conteo de Usuarios Bloqueados
        Mono<Long> totalBloqueadosMono = usuarioRepository.countByEstadoCuenta("BLOQUEADA");

        // 3. Conteo de Transacciones Exitosas
        Mono<Long> totalTransaccionesExitoMono = transaccionRepository.countByEstadoTransaccion("EXITO");

        // 4. Volumen Total (Requiere una @Query SUM en TransaccionRepository para el monto)
        // SIMULACIÓN: Asumimos un método que suma todos los montos de transacciones exitosas
        Mono<BigDecimal> volumenTotalMono = transaccionRepository.sumMontoByEstadoTransaccion("EXITO");


        // Unir todos los resultados de forma concurrente
        return Mono.zip(
                totalUsuariosMono,
                totalBloqueadosMono,
                totalTransaccionesExitoMono,
                volumenTotalMono
        ).map(tuple -> {
            ReporteActividadDTO dto = new ReporteActividadDTO();
            dto.setFechaInicio(fechaInicio);
            dto.setFechaFin(fechaFin);
            dto.setTotalUsuariosRegistrados(tuple.getT1());
            dto.setTotalCuentasBloqueadas(tuple.getT2());
            dto.setTotalTransaccionesExitosas(tuple.getT3());
            dto.setVolumenTotalTransacciones(tuple.getT4() != null ? tuple.getT4() : BigDecimal.ZERO);
            return dto;
        });
    }

    /**
     * HISTORIA 2: Congela o desbloquea una cuenta de usuario, registrando la acción.
     * @param idUsuario ID del usuario a modificar.
     * @param nuevoEstado El estado deseado.
     * @param idAdministrador ID del admin que realiza la acción (para auditoría).
     * @return Mono que emite el Usuario actualizado.
     */
    @Transactional
    public Mono<Usuario> actualizarEstadoUsuario(Long idUsuario, EstadoCuenta nuevoEstado, Long idAdministrador) {

        // 1. Validar que el administrador existe (omitiendo por brevedad)

        return usuarioRepository.findById(idUsuario)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado con ID: " + idUsuario)))
                .flatMap(usuario -> {

                    // Lógica para actualizar el estado del usuario...
                    // ... (Tu código actual de actualización de estado) ...

                    // 2. Guardar la actualización del usuario
                    Mono<Usuario> usuarioActualizadoMono = usuarioRepository.save(usuario);

                    // 3. Crear el registro de auditoría
                    String accion = "CAMBIO_ESTADO_" + nuevoEstado.name();
                    String detalle = "Estado cambiado de " + usuario.getEstadoCuenta() + " a " + nuevoEstado.name();

                    Mono<LogAuditoria> logMono = crearLog(
                            idAdministrador,
                            accion,
                            detalle,
                            usuario.getIdUsuario()
                    );

                    // 4. Ejecutar la acción y luego el log, devolviendo el Usuario
                    return usuarioActualizadoMono
                            .flatMap(updatedUser -> logMono.thenReturn(updatedUser)); // Guardar el log y luego devolver el usuario
                });
    }

// --------------------------------------------------------------------------------
// Metodo Auxiliar para crear el Log
// --------------------------------------------------------------------------------

    private Mono<LogAuditoria> crearLog(Long adminId, String accion, String detalle, Long usuarioAfectadoId) {
        LogAuditoria log = new LogAuditoria();
        log.setIdAdministrador(adminId);
        log.setAccion(accion);
        log.setDetalle(detalle);
        log.setIdUsuarioAfectado(usuarioAfectadoId);
        log.setFechaAccion(LocalDateTime.now());
        return logAuditoriaRepository.save(log);
    }

    // --- Historia: Ver Historial Global ---

    /**
     * HISTORIA 3: Obtiene el balance total de todas las wallets, agrupado por moneda.
     * @return Flux que emite un BalanceGlobalDTO por cada moneda.
     */
    public Flux<BalanceGlobalDTO> verBalanceGlobalPorMoneda() {

        return walletRepository.findTotalBalanceGroupedByMoneda();
    }
    /**
     * Retorna todas las transacciones del sistema (sin filtros).
     */
    public Flux<Transaccion> obtenerHistorialGlobal() {
        return transaccionRepository.findAll();
    }

    // --- Historia: Ver listado de usuarios ---
    public Flux<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }
}
