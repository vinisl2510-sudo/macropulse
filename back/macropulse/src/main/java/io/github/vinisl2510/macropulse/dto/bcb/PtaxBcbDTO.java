package io.github.vinisl2510.macropulse.dto.bcb;

import java.math.BigDecimal;

public record PtaxBcbDTO(BigDecimal cotacaoCompra,
                         BigDecimal cotacaoVenda,
                         String dataHoraCotacao) {
}
