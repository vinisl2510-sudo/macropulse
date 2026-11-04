package io.github.vinisl2510.macropulse.service;

import io.github.vinisl2510.macropulse.dto.response.JuroRealDTO;
import io.github.vinisl2510.macropulse.dto.response.VariacaoDTO;
import io.github.vinisl2510.macropulse.exception.DadosNaoEncontradosException;
import io.github.vinisl2510.macropulse.model.Indicador;
import io.github.vinisl2510.macropulse.model.TipoIndicador;
import io.github.vinisl2510.macropulse.repository.IndicadorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IndicadorQueryServiceTest {

    @Mock
    private IndicadorRepository indicadorRepository;

    @InjectMocks
    private IndicadorQueryService indicadorQueryService;

    // ---------- helper: cria um Indicador com uma linha ----------
    private Optional<Indicador> indicador(TipoIndicador tipo, LocalDate data, String valor) {
        return Optional.of(new Indicador(tipo, data, new BigDecimal(valor)));
    }

    // ======================= JURO REAL =======================

    @Test
    void deveCalcularJuroRealPelaFormulaDeFisher() {
        when(indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.SELIC))
                .thenReturn(indicador(TipoIndicador.SELIC, LocalDate.of(2026, 11, 2), "15"));
        when(indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.IPCA_ESPERADO_12M))
                .thenReturn(indicador(TipoIndicador.IPCA_ESPERADO_12M, LocalDate.of(2026, 10, 30), "5"));

        JuroRealDTO resultado = indicadorQueryService.juroReal();

        assertThat(resultado.juroReal()).isEqualByComparingTo("9.52");
        assertThat(resultado.selic()).isEqualByComparingTo("15");
        assertThat(resultado.ipca()).isEqualByComparingTo("5");
        assertThat(resultado.dataPrevista()).isEqualTo(LocalDate.of(2026, 10, 30));
    }

    @Test
    void juroRealDeveSerNegativoQuandoInflacaoSuperaASelic() {
        when(indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.SELIC))
                .thenReturn(indicador(TipoIndicador.SELIC, LocalDate.of(2026, 11, 2), "4"));
        when(indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.IPCA_ESPERADO_12M))
                .thenReturn(indicador(TipoIndicador.IPCA_ESPERADO_12M, LocalDate.of(2026, 10, 30), "6"));

        JuroRealDTO resultado = indicadorQueryService.juroReal();

        assertThat(resultado.juroReal()).isEqualByComparingTo("-1.89");
    }

    @Test
    void deveLancarExcecaoQuandoNaoHaSelicNoBanco() {

        assertThatThrownBy(() -> indicadorQueryService.juroReal())
                .isInstanceOf(DadosNaoEncontradosException.class);
    }


    @Test
    void deveCalcularAltaDoDolarEm30Dias() {
        when(indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.DOLAR))
                .thenReturn(indicador(TipoIndicador.DOLAR, LocalDate.of(2026, 10, 30), "5.50"));
        when(indicadorRepository.findTopByTipoAndDataLessThanEqualOrderByDataDesc(
                TipoIndicador.DOLAR, LocalDate.of(2026, 9, 30)))
                .thenReturn(indicador(TipoIndicador.DOLAR, LocalDate.of(2026, 9, 30), "5.00"));

        VariacaoDTO resultado = indicadorQueryService.dolarVariacao(30);

        assertThat(resultado.variacaoPorcentual()).isEqualByComparingTo("10.00");
        assertThat(resultado.valorInicial()).isEqualByComparingTo("5.00");
        assertThat(resultado.valorFinal()).isEqualByComparingTo("5.50");
        assertThat(resultado.dias()).isEqualTo(30);
    }

    @Test
    void deveCalcularQuedaDoDolarEm30Dias() {
        when(indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.DOLAR))
                .thenReturn(indicador(TipoIndicador.DOLAR, LocalDate.of(2026, 10, 30), "4.50"));
        when(indicadorRepository.findTopByTipoAndDataLessThanEqualOrderByDataDesc(
                TipoIndicador.DOLAR, LocalDate.of(2026, 9, 30)))
                .thenReturn(indicador(TipoIndicador.DOLAR, LocalDate.of(2026, 9, 30), "5.00"));

        VariacaoDTO resultado = indicadorQueryService.dolarVariacao(30);

        assertThat(resultado.variacaoPorcentual()).isEqualByComparingTo("-10.00");
    }
}