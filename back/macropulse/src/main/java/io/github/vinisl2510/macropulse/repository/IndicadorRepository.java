package io.github.vinisl2510.macropulse.repository;

import io.github.vinisl2510.macropulse.model.Indicador;
import io.github.vinisl2510.macropulse.model.TipoIndicador;
import jakarta.persistence.OrderBy;
import org.hibernate.query.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IndicadorRepository extends JpaRepository<Indicador,Long > {
    Optional<Indicador> findTopByTipoOrderByDataDesc(TipoIndicador tipo);
    boolean existsByDataAndTipo(LocalDate data, TipoIndicador tipo);
    List<Indicador>findByTipoAndDataBetweenOrderByDataAsc(TipoIndicador tipo, LocalDate dataInicio, LocalDate dataFim);
    Optional<Indicador> findTopByTipoAndDataLessThanEqualOrderByDataDesc(TipoIndicador tipo, LocalDate data);

}
