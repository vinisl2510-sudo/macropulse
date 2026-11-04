package io.github.vinisl2510.macropulse.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JuroRealDTO(BigDecimal selic,
                          BigDecimal ipca,
                          BigDecimal juroReal,
                          LocalDate dataPrevista) {
}
