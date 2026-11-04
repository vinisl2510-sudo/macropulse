package io.github.vinisl2510.macropulse.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SimulacaoResponseDTO(BigDecimal valorInvestido,
                                   Integer prazoDias,
                                   BigDecimal selicUsada,
                                   List<ResultadoInvestimentoDTO> resultados) {
}
