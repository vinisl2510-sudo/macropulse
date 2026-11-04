package io.github.vinisl2510.macropulse.service;

import io.github.vinisl2510.macropulse.dto.request.SimulacaoRequestDTO;
import io.github.vinisl2510.macropulse.dto.response.CotacaoDTO;
import io.github.vinisl2510.macropulse.dto.response.ResultadoInvestimentoDTO;
import io.github.vinisl2510.macropulse.dto.response.SimulacaoResponseDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SimuladorServiceTest {

    @Mock
    private IndicadorQueryService indicadorQueryService;

    @InjectMocks
    private SimuladorService simuladorService;

    @Test
    void deveCalcularOsTresProdutosComSelicDe15() {

        when(indicadorQueryService.selicAtual())
                .thenReturn(new CotacaoDTO(LocalDate.of(2026, 11, 2),
                        new BigDecimal("15")));

        SimulacaoRequestDTO request = new SimulacaoRequestDTO(
                new BigDecimal("1000"), 365, new BigDecimal("110"));

        SimulacaoResponseDTO resposta = simuladorService.simular(request);


        ResultadoInvestimentoDTO cdb = resposta.resultados().get(0);
        assertThat(cdb.valorBruto()).isEqualByComparingTo("1163.90");
        assertThat(cdb.impostoRenda()).isEqualByComparingTo("28.68");
        assertThat(cdb.valorLiquido()).isEqualByComparingTo("1135.22");

        ResultadoInvestimentoDTO tesouro = resposta.resultados().get(1);
        assertThat(tesouro.valorBruto()).isEqualByComparingTo("1150.00");
        assertThat(tesouro.impostoRenda()).isEqualByComparingTo("26.25");

        ResultadoInvestimentoDTO poupanca = resposta.resultados().get(2);
        assertThat(poupanca.valorBruto()).isEqualByComparingTo("1061.70");
        assertThat(poupanca.impostoRenda()).isEqualByComparingTo("0");
    }

    @ParameterizedTest
    @CsvSource({
            "1,   22.5",
            "180, 22.5",
            "181, 20",
            "360, 20",
            "361, 17.5",
            "720, 17.5",
            "721, 15"
    })
    void deveAplicarAliquotaDeIrConformeOPrazo(int dias, BigDecimal aliquotaEsperada) {
        assertThat(simuladorService.aliquotaIr(dias)).isEqualByComparingTo(aliquotaEsperada);
    }

    @Test
    void deveRenderSetentaPorCentoDaSelicNaPoupancaQuandoSelicBaixa(){
        when(indicadorQueryService.selicAtual())
                .thenReturn(new CotacaoDTO(LocalDate.of(2026, 11, 2), new BigDecimal("8")));

        SimulacaoRequestDTO request = new SimulacaoRequestDTO(
                new BigDecimal("1000"), 365, new BigDecimal("110"));

        SimulacaoResponseDTO resposta = simuladorService.simular(request);

        ResultadoInvestimentoDTO poupanca = resposta.resultados().get(2);
        assertThat(poupanca.valorBruto()).isEqualByComparingTo("1056.00");
        assertThat(poupanca.impostoRenda()).isEqualByComparingTo("0");

    }
}
