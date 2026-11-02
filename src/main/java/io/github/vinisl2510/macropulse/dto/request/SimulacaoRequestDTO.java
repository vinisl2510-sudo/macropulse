package io.github.vinisl2510.macropulse.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record SimulacaoRequestDTO(@NotNull @Positive BigDecimal valor,
                                  @NotNull @Positive Integer prazoDias,
                                  @NotNull @Positive BigDecimal percentualCdi) {
}
