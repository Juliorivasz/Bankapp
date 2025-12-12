package com.bankapp.service;

import com.bankapp.model.dto.dashboard.DashboardDTO;
import com.bankapp.model.dto.dashboard.TransaccionInfoDTO;
import com.bankapp.model.dto.dashboard.WalletInfoDTO;
import com.bankapp.repository.TipoMonedaRepository;
import com.bankapp.repository.TransaccionRepository;
import com.bankapp.repository.UsuarioRepository;
import com.bankapp.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private final UsuarioRepository usuarioRepository;
  private final WalletRepository walletRepository;
  private final TransaccionRepository transaccionRepository;
  private final TipoMonedaRepository tipoMonedaRepository;

  public Mono<DashboardDTO> obtenerDashboard(String username, LocalDateTime fechaInicioParam, LocalDateTime fechaFinParam) {
    return usuarioRepository.findByNombreUsuario(username)
        .flatMap(usuario -> {
          // 1. Obtener Wallets
          return obtenerWalletsInfo(usuario.getIdUsuario())
              .collectList()
              .flatMap(wallets -> {
                BigDecimal balanceTotal = wallets.stream()
                    .map(WalletInfoDTO::getBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (wallets.isEmpty()) {
                  return Mono.just(new DashboardDTO(usuario.getNombreUsuario(), BigDecimal.ZERO, wallets, List.of(),
                      new DashboardDTO.EstadisticasDTO(0, BigDecimal.ZERO, BigDecimal.ZERO), List.of()));
                }

                List<String> numerosCuenta = wallets.stream()
                        .map(WalletInfoDTO::getNumeroCuenta)
                        .toList();

                // Fechas por defecto: Últimos 30 días si no se especifica
                LocalDateTime fechaInicio = (fechaInicioParam != null) ? fechaInicioParam : LocalDateTime.now().minusDays(30);
                // Si fechaFin es null, usamos NOW
                LocalDateTime fechaFin = (fechaFinParam != null) ? fechaFinParam : LocalDateTime.now();


                return obtenerTransaccionesProcesadas(numerosCuenta, fechaInicio) // TODO: Filtrar también fechaFin en query si se necesita estricto
                    .filter(t -> {
                        // Filtrado adicional en memoria para fechaFin si es necesario, 
                        // aunque la query toma "After" fecha inicio.
                         LocalDateTime tFecha = LocalDateTime.parse(t.getFecha()); 
                         return !tFecha.isAfter(fechaFin);
                    })
                    .collectList()
                    .map(transacciones -> {
                      DashboardDTO.EstadisticasDTO stats = calcularEstadisticas(transacciones);
                      List<DashboardDTO.BalanceDiarioDTO> balanceDiario = calcularBalanceDiario(transacciones);

                      return new DashboardDTO(
                          usuario.getNombreUsuario(),
                          balanceTotal,
                          wallets,
                          transacciones,
                          stats,
                          balanceDiario);
                    });
              });
        });
  }

  private Flux<WalletInfoDTO> obtenerWalletsInfo(Long idUsuario) {
    return walletRepository.findByIdUsuario(idUsuario)
        .flatMap(wallet -> tipoMonedaRepository.findById(wallet.getIdMoneda())
            .map(moneda -> new WalletInfoDTO(
                wallet.getIdWallet(),
                wallet.getNumeroCuenta(),
                wallet.getBalance(),
                moneda.getNombreMoneda(),
                moneda.getSimboloMoneda(),
                wallet.getEstadoWallet())));
  }

  private Flux<TransaccionInfoDTO> obtenerTransaccionesProcesadas(List<String> numerosCuenta, LocalDateTime fechaInicio) {
    return transaccionRepository
        .findByNumeroCuentaInAndFechaTransaccionAfterOrderByFechaTransaccionDesc(numerosCuenta, fechaInicio)
        .map(t -> {
          return new TransaccionInfoDTO(
              t.getIdTransaccion(),
              t.getFechaTransaccion().toString(),
              t.getDescripcion(),
              t.getMonto(),
              t.getTipoTransaccion() != null ? t.getTipoTransaccion() : inferirTipo(t),
              BigDecimal.ZERO, 
              t.getEstadoTransaccion().toString(),
              t.getNumeroCuenta());
        });
  }

  private String inferirTipo(com.bankapp.model.Transaccion t) {
    if (t.getTipoTransaccion() != null) {
        return t.getTipoTransaccion();
    }
    String descripcion = t.getDescripcion();
    if (descripcion == null) return "OTRO";
    String desc = descripcion.toUpperCase();
    
    if (desc.contains("DEPOSITO") || desc.contains("DEPÓSITO")) return "DEPOSITO";
    if (desc.contains("RETIRO")) return "RETIRO";
    if (desc.contains("ENVIADA") || desc.contains("ENVÍO") || desc.contains("ENVIO")) return "TRANSFERENCIA_ENVIADA";
    if (desc.contains("RECIBIDA") || desc.contains("RECIBIDO")) return "TRANSFERENCIA_RECIBIDA";
    return "OTRO";
  }

  private DashboardDTO.EstadisticasDTO calcularEstadisticas(List<TransaccionInfoDTO> transacciones) {
    int total = transacciones.size();
    BigDecimal ingresos = BigDecimal.ZERO;
    BigDecimal egresos = BigDecimal.ZERO;

    for (TransaccionInfoDTO t : transacciones) {
      if ("DEPOSITO".equals(t.getTipo()) || "TRANSFERENCIA_RECIBIDA".equals(t.getTipo())) {
        ingresos = ingresos.add(t.getMonto());
      } else {
        egresos = egresos.add(t.getMonto());
      }
    }
    return new DashboardDTO.EstadisticasDTO(total, ingresos, egresos);
  }

  private List<DashboardDTO.BalanceDiarioDTO> calcularBalanceDiario(List<TransaccionInfoDTO> transacciones) {
      // Agrupar por fecha (YYYY-MM-DD)
      java.util.Map<String, DashboardDTO.BalanceDiarioDTO> map = new java.util.HashMap<>();

      for (TransaccionInfoDTO t : transacciones) {
          // Extraer fecha YYYY-MM-DD
          String fechaFull = t.getFecha(); // ISO String
          String fechaDia = fechaFull.substring(0, 10);

          DashboardDTO.BalanceDiarioDTO dia = map.getOrDefault(fechaDia, new DashboardDTO.BalanceDiarioDTO(fechaDia, BigDecimal.ZERO, BigDecimal.ZERO));
          
          if ("DEPOSITO".equals(t.getTipo()) || "TRANSFERENCIA_RECIBIDA".equals(t.getTipo())) {
              dia.setIngresos(dia.getIngresos().add(t.getMonto().abs())); // Asegurar positivo
          } else {
              dia.setEgresos(dia.getEgresos().add(t.getMonto().abs()));
          }
          map.put(fechaDia, dia);
      }

      // Ordenar por fecha
      return map.values().stream()
              .sorted((a, b) -> a.getFecha().compareTo(b.getFecha()))
              .collect(java.util.stream.Collectors.toList());
  }
}
