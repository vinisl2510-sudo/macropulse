package io.github.vinisl2510.macropulse.controller;

import io.github.vinisl2510.macropulse.dto.response.CotacaoDTO;
import io.github.vinisl2510.macropulse.dto.response.JuroRealDTO;
import io.github.vinisl2510.macropulse.dto.response.VariacaoDTO;
import io.github.vinisl2510.macropulse.service.IndicadorQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Indicadores", description = "Cotações atuais, históricos e cálculos (juro real e variação) dos indicadores do Banco Central")
@RestController
@RequestMapping("/api/indicadores")
public class IndicadorController {
    private final IndicadorQueryService indicadorQueryService;

    public IndicadorController(IndicadorQueryService indicadorQueryService) {
        this.indicadorQueryService = indicadorQueryService;
    }

    @Operation(summary = "Selic atual", description = "Retorna a taxa Selic meta mais recente salva no banco (% ao ano)")
    @GetMapping("/selic/atual")
    public CotacaoDTO selicAtual(){
        return indicadorQueryService.selicAtual();
    }

    @Operation(summary = "Dólar atual", description = "Retorna a cotação de venda do dólar (PTAX) mais recente salva no banco, em reais")
    @GetMapping("/dolar/atual")
    public CotacaoDTO dolarAtual(){
        return indicadorQueryService.dolarAtual();
    }

    @Operation(summary = "Euro atual", description = "Retorna a cotação de venda do euro (PTAX de fechamento) mais recente salva no banco, em reais")
    @GetMapping("/euro/atual")
    public CotacaoDTO euroAtual(){return indicadorQueryService.euroAtual();}

    @Operation(summary = "Histórico da Selic", description = "Retorna a Selic meta de cada dia do período informado. Datas no formato yyyy-MM-dd")
    @GetMapping("/selic/historico")
    public List<CotacaoDTO> selicHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.selicHistorico(inicio, fim);
    }

    @Operation(summary = "Histórico do dólar", description = "Retorna a cotação do dólar de cada dia útil do período informado. Datas no formato yyyy-MM-dd")
    @GetMapping("/dolar/historico")
    public List<CotacaoDTO> dolarHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.dolarHistorico(inicio, fim);
    }

    @Operation(summary = "Histórico do euro", description = "Retorna a cotação do euro de cada dia útil do período informado. Datas no formato yyyy-MM-dd")
    @GetMapping("/euro/historico")
    public List<CotacaoDTO> euroHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.euroHistorico(inicio, fim);
    }

    @Operation(summary = "Histórico do IPCA", description = "Retorna o IPCA mensal (% no mês) dos meses do período informado. Datas no formato yyyy-MM-dd")
    @GetMapping("/ipca/historico")
    public List<CotacaoDTO> ipcaHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.ipcaHistorico(inicio, fim);
    }

    @Operation(summary = "Variação do dólar", description = "Calcula a variação percentual do dólar nos últimos N dias (padrão: 30), comparando a cotação mais recente com a da data de corte")
    @GetMapping("/dolar/variacao")
    public VariacaoDTO dolarVariacao(@RequestParam(defaultValue = "30") @Min(1) int dias) {
        return indicadorQueryService.dolarVariacao(dias);
    }

    @Operation(summary = "Juro real", description = "Calcula o juro real pela fórmula de Fisher: (1 + Selic) / (1 + IPCA esperado) - 1, usando a Selic atual e a expectativa de IPCA para 12 meses do boletim Focus")
    @GetMapping("/juro-real")
    public JuroRealDTO juroReal() {
        return indicadorQueryService.juroReal();
    }


}
