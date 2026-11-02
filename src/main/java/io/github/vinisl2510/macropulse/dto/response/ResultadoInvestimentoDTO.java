package io.github.vinisl2510.macropulse.dto.response;

import java.math.BigDecimal;

public record ResultadoInvestimentoDTO(String produto,
                                       BigDecimal valorBruto,
                                       BigDecimal rendimentoBruto,
                                       BigDecimal impostoRenda,
                                       BigDecimal valorLiquido,
                                       BigDecimal rendimentoLiquido) {
}
