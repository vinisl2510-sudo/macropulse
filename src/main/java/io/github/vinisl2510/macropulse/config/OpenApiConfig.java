package io.github.vinisl2510.macropulse.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI macroPulseOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MacroPulse")
                        .description("API de indicadores macroeconômicos do Brasil. Coleta diariamente "
                                + "Selic, dólar, euro, IPCA e expectativa de inflação do Banco Central "
                                + "(SGS, PTAX e Focus), calcula juro real e variação cambial, e oferece "
                                + "um simulador de investimentos (CDB, Tesouro Selic e poupança).")
                        .version("0.10.0"));
    }
}