package io.github.vinisl2510.macropulse.controller;

import io.github.vinisl2510.macropulse.dto.response.CotacaoDTO;
import io.github.vinisl2510.macropulse.dto.response.JuroRealDTO;
import io.github.vinisl2510.macropulse.dto.response.VariacaoDTO;
import io.github.vinisl2510.macropulse.service.IndicadorQueryService;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/indicadores")
public class IndicadorController {
    private final IndicadorQueryService indicadorQueryService;

    public IndicadorController(IndicadorQueryService indicadorQueryService) {
        this.indicadorQueryService = indicadorQueryService;
    }

    @GetMapping("/selic/atual")
    public CotacaoDTO selicAtual(){
        return indicadorQueryService.selicAtual();
    }

    @GetMapping("/dolar/atual")
    public CotacaoDTO dolarAtual(){
        return indicadorQueryService.dolarAtual();
    }

    @GetMapping("/euro/atual")
    public CotacaoDTO euroAtual(){return indicadorQueryService.euroAtual();}

    @GetMapping("/selic/historico")
    public List<CotacaoDTO> selicHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.selicHistorico(inicio, fim);
    }

    @GetMapping("/dolar/historico")
    public List<CotacaoDTO> dolarHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.dolarHistorico(inicio, fim);
    }

    @GetMapping("/euro/historico")
    public List<CotacaoDTO> euroHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.euroHistorico(inicio, fim);
    }

    @GetMapping("/ipca/historico")
    public List<CotacaoDTO> ipcaHistorico(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                           @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim){
        return indicadorQueryService.ipcaHistorico(inicio, fim);
    }

    @GetMapping("/dolar/variacao")
    public VariacaoDTO dolarVariacao(@RequestParam(defaultValue = "30") @Min(1) int dias) {
        return indicadorQueryService.dolarVariacao(dias);
    }

    @GetMapping("/juro-real")
    public JuroRealDTO juroReal() {
        return indicadorQueryService.juroReal();
    }


}
