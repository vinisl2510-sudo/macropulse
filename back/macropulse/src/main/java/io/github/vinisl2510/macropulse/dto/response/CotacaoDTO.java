package io.github.vinisl2510.macropulse.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CotacaoDTO(LocalDate data,
                         BigDecimal valor) {
}
