package io.github.vinisl2510.macropulse.dto.response;

import java.math.BigDecimal;

public record VariacaoDTO(int dias,
                          BigDecimal valorInicial,
                          BigDecimal valorFinal,
                          BigDecimal variacaoPorcentual) {
}
