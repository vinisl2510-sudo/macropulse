package io.github.vinisl2510.macropulse.service;

import io.github.vinisl2510.macropulse.dto.request.SimulacaoRequestDTO;
import io.github.vinisl2510.macropulse.dto.response.ResultadoInvestimentoDTO;
import io.github.vinisl2510.macropulse.dto.response.SimulacaoResponseDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class SimuladorService {
    private final IndicadorQueryService indicadorQueryService;

    public SimuladorService(IndicadorQueryService indicadorQueryService) {
        this.indicadorQueryService = indicadorQueryService;
    }

    private BigDecimal taxaPoupanca(BigDecimal selic) {
        if (selic.compareTo(new BigDecimal("8.5")) > 0) {
            return new BigDecimal("6.17");
        }
        return selic.multiply(new BigDecimal("0.7"));
    }

    public SimulacaoResponseDTO simular(SimulacaoRequestDTO request) {
        BigDecimal valor = request.valor();
        int dias = request.prazoDias();

        BigDecimal selic = indicadorQueryService.selicAtual().valor();
        BigDecimal cdi = selic.subtract(new BigDecimal("0.10"));

        BigDecimal taxaCdb = cdi.multiply(request.percentualCdi())
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        BigDecimal aliquota = aliquotaIr(dias);

        ResultadoInvestimentoDTO cdb = montarResultado(
                "CDB " + request.percentualCdi() + "% do CDI",
                valor,
                calcularValorBruto(valor, taxaCdb, dias),
                aliquota);

        ResultadoInvestimentoDTO tesouro = montarResultado(
                "Tesouro Selic",
                valor,
                calcularValorBruto(valor, selic, dias),
                aliquota);

        ResultadoInvestimentoDTO poupanca = montarResultado(
                "Poupança",
                valor,
                calcularValorBruto(valor, taxaPoupanca(selic), dias),
                BigDecimal.ZERO);

        return new SimulacaoResponseDTO(valor, dias, selic,
                List.of(cdb, tesouro, poupanca));
    }

    private BigDecimal aliquotaIr(int dias) {
        if (dias <= 180) {
            return new BigDecimal("22.5");
        }
        if (dias <= 360) {
            return new BigDecimal("20");
        }
        if (dias <= 720){
            return new BigDecimal("17.5");
        }
        return new BigDecimal("15");
    }

    private BigDecimal calcularValorBruto(BigDecimal valor, BigDecimal taxaAnual, int dias) {
        double base = 1 + taxaAnual.doubleValue() / 100;
        double expoente = dias / 365.0;
        double fator = Math.pow(base, expoente);

        return valor.multiply(BigDecimal.valueOf(fator))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private ResultadoInvestimentoDTO montarResultado(String produto, BigDecimal valor,
                                                     BigDecimal valorBruto, BigDecimal aliquota) {

        BigDecimal rendimentoBruto = valorBruto.subtract(valor);

        BigDecimal impostoRenda = rendimentoBruto.multiply(aliquota)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal valorLiquido = valorBruto.subtract(impostoRenda);

        BigDecimal rendimentoLiquido = rendimentoBruto.subtract(impostoRenda);

        return new ResultadoInvestimentoDTO(produto, valorBruto,
                rendimentoBruto,impostoRenda,
                valorLiquido,rendimentoLiquido);
    }
}
