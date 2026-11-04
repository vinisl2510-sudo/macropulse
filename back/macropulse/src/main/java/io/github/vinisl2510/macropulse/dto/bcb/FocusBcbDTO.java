package io.github.vinisl2510.macropulse.dto.bcb;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record FocusBcbDTO(@JsonProperty("Data")String  data,
                          @JsonProperty("Mediana")BigDecimal mediana) {
}
