package io.github.vinisl2510.macropulse.controller;

import io.github.vinisl2510.macropulse.dto.response.ResultadoInvestimentoDTO;
import io.github.vinisl2510.macropulse.dto.response.SimulacaoResponseDTO;
import io.github.vinisl2510.macropulse.service.SimuladorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SimuladorController.class)
class SimuladorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SimuladorService simuladorService;

    @Test
    void deveRetornar200ComOsTresProdutosQuandoRequisicaoValida() throws Exception {
        SimulacaoResponseDTO respostaFalsa = new SimulacaoResponseDTO(
                new BigDecimal("1000"), 365, new BigDecimal("15"),
                List.of(
                        new ResultadoInvestimentoDTO("CDB 110% do CDI",
                                new BigDecimal("1163.90"), new BigDecimal("163.90"),
                                new BigDecimal("28.68"), new BigDecimal("1135.22"), new BigDecimal("135.22")),
                        new ResultadoInvestimentoDTO("Tesouro Selic",
                                new BigDecimal("1150.00"), new BigDecimal("150.00"),
                                new BigDecimal("26.25"), new BigDecimal("1123.75"), new BigDecimal("123.75")),
                        new ResultadoInvestimentoDTO("Poupança",
                                new BigDecimal("1061.70"), new BigDecimal("61.70"),
                                BigDecimal.ZERO, new BigDecimal("1061.70"), new BigDecimal("61.70"))));

        when(simuladorService.simular(any())).thenReturn(respostaFalsa);

        mockMvc.perform(post("/api/simulador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "valor": 1000, "prazoDias": 365, "percentualCdi": 110 }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prazoDias").value(365))
                .andExpect(jsonPath("$.resultados.length()").value(3))
                .andExpect(jsonPath("$.resultados[0].produto").value("CDB 110% do CDI"))
                .andExpect(jsonPath("$.resultados[2].produto").value("Poupança"));

        // o controller repassou o pedido para o service exatamente uma vez
        verify(simuladorService).simular(any());
    }

    @Test
    void deveRetornar400SemChamarOServiceQuandoDadosInvalidos() throws Exception {
        // GIVEN: valor negativo e sem prazoDias
        mockMvc.perform(post("/api/simulador")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "valor": -5, "percentualCdi": 110 }
                                """))

                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Dados inválidos"))
                .andExpect(jsonPath("$.detail").value(containsString("prazoDias")))
                .andExpect(jsonPath("$.detail").value(containsString("valor")));

        verifyNoInteractions(simuladorService);
    }
}