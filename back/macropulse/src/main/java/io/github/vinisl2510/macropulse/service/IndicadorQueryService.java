package io.github.vinisl2510.macropulse.service;

import io.github.vinisl2510.macropulse.dto.response.CotacaoDTO;
import io.github.vinisl2510.macropulse.dto.response.JuroRealDTO;
import io.github.vinisl2510.macropulse.dto.response.VariacaoDTO;
import io.github.vinisl2510.macropulse.exception.DadosNaoEncontradosException;
import io.github.vinisl2510.macropulse.model.Indicador;
import io.github.vinisl2510.macropulse.model.TipoIndicador;
import io.github.vinisl2510.macropulse.repository.IndicadorRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class IndicadorQueryService {
    private final IndicadorRepository indicadorRepository;

    public IndicadorQueryService(IndicadorRepository indicadorRepository) {
        this.indicadorRepository = indicadorRepository;
    }

    @Cacheable("selicAtual")
    public CotacaoDTO selicAtual(){
       return indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.SELIC)
                .map(ultimo -> new CotacaoDTO(ultimo.getData(), ultimo.getValor()))
                .orElseThrow(() -> new DadosNaoEncontradosException("Nenhum valor da Selic encontrado"));

    }

    @Cacheable("dolarAtual")
    public CotacaoDTO dolarAtual(){
        return indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.DOLAR)
                .map(ultimo -> new CotacaoDTO(ultimo.getData(), ultimo.getValor()))
                .orElseThrow(() -> new DadosNaoEncontradosException("Nenhum valor da dolar encontrado"));
    }

    @Cacheable("euroAtual")
    public CotacaoDTO euroAtual(){
        return indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.EURO)
                .map(ultimo -> new CotacaoDTO(ultimo.getData(), ultimo.getValor()))
                .orElseThrow(() -> new DadosNaoEncontradosException("Nenhum valor da euro encontrado"));
    }

    @Cacheable("selicHistorico")
    public List<CotacaoDTO> selicHistorico(LocalDate inicio, LocalDate fim) {
        return indicadorRepository.findByTipoAndDataBetweenOrderByDataAsc(TipoIndicador.SELIC, inicio, fim)
                .stream()
                .map(selic -> new CotacaoDTO(selic.getData(), selic.getValor()))
                .toList();
    }

    @Cacheable("dolarHistorico")
        public List<CotacaoDTO> dolarHistorico(LocalDate inicio, LocalDate fim){
        return indicadorRepository.findByTipoAndDataBetweenOrderByDataAsc(TipoIndicador.DOLAR, inicio, fim)
                .stream()
                .map(dolar -> new CotacaoDTO(dolar.getData(), dolar.getValor()))
                .toList();
    }

    @Cacheable("euroHistorico")
    public List<CotacaoDTO> euroHistorico(LocalDate inicio, LocalDate fim){
        return indicadorRepository.findByTipoAndDataBetweenOrderByDataAsc(TipoIndicador.EURO, inicio, fim)
                .stream()
                .map(euro -> new CotacaoDTO(euro.getData(), euro.getValor()))
                .toList();
    }

    @Cacheable("ipcaHistorico")
    public List<CotacaoDTO> ipcaHistorico(LocalDate inicio, LocalDate fim) {
        return indicadorRepository.findByTipoAndDataBetweenOrderByDataAsc(TipoIndicador.IPCA, inicio, fim)
                .stream()
                .map(ipca -> new CotacaoDTO(ipca.getData(), ipca.getValor()))
                .toList();
    }


    @Cacheable("dolarVariacao")
    public VariacaoDTO dolarVariacao(int dias){
        Indicador ultimo = indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.DOLAR)
                .orElseThrow(() -> new DadosNaoEncontradosException("Dados Não Encontrados"));

        LocalDate dataCorte = ultimo.getData().minusDays(dias);

        Indicador anterior = indicadorRepository.findTopByTipoAndDataLessThanEqualOrderByDataDesc(TipoIndicador.DOLAR, dataCorte)
            .orElseThrow(() -> new DadosNaoEncontradosException("Não há cotações suficientes para os últimos " + dias + " dias"));

        BigDecimal valorFinal = ultimo.getValor();
        BigDecimal valorInicial = anterior.getValor();
        BigDecimal variacao = valorFinal.subtract(valorInicial)
                .divide(valorInicial, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);

        return new VariacaoDTO(dias, valorInicial, valorFinal, variacao);
    }

    @Cacheable("JuroReal")
    public JuroRealDTO juroReal(){
        Indicador ultimoSelic = indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.SELIC)
                .orElseThrow(() -> new DadosNaoEncontradosException("Nenhum valor da Selic encontrado"));
        Indicador ultimoIpca = indicadorRepository.findTopByTipoOrderByDataDesc(TipoIndicador.IPCA_ESPERADO_12M)
                .orElseThrow(() -> new DadosNaoEncontradosException("Nenhuma previsão do IPCA encontrada"));

        BigDecimal selic = ultimoSelic.getValor();
        BigDecimal ipca = ultimoIpca.getValor();

        BigDecimal fatorSelic = selic.divide(BigDecimal.valueOf(100),6, RoundingMode.HALF_UP).add(BigDecimal.valueOf(1));
        BigDecimal fatorIpca = ipca.divide(BigDecimal.valueOf(100),6, RoundingMode.HALF_UP).add(BigDecimal.valueOf(1));
        BigDecimal juroReal = fatorSelic.divide( fatorIpca, 6, RoundingMode.HALF_UP)
        .subtract(BigDecimal.valueOf(1))
        .multiply(BigDecimal.valueOf(100))
        .setScale(2, RoundingMode.HALF_UP);

        return new JuroRealDTO(selic, ipca, juroReal,ultimoIpca.getData());
    }
}
