package io.github.vinisl2510.macropulse.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "indicador")
public class Indicador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private TipoIndicador tipo;
    private LocalDate data;
    private BigDecimal valor;

    public Indicador(TipoIndicador tipo, LocalDate data, BigDecimal valor) {
        this.tipo = tipo;
        this.data = data;
        this.valor = valor;
    }

}
