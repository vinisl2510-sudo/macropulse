package io.github.vinisl2510.macropulse.service;

import io.github.vinisl2510.macropulse.client.FocusClient;
import io.github.vinisl2510.macropulse.client.PtaxClient;
import io.github.vinisl2510.macropulse.client.SelicClient;
import io.github.vinisl2510.macropulse.dto.bcb.FocusBcbDTO;
import io.github.vinisl2510.macropulse.dto.bcb.PtaxBcbDTO;
import io.github.vinisl2510.macropulse.dto.bcb.PtaxRespostaBcbDTO;
import io.github.vinisl2510.macropulse.dto.bcb.SelicBcbDTO;
import io.github.vinisl2510.macropulse.model.Indicador;
import io.github.vinisl2510.macropulse.model.TipoIndicador;
import io.github.vinisl2510.macropulse.repository.IndicadorRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AtualizacaoService {
    private final IndicadorRepository repository;
    private final SelicClient client;
    private final PtaxClient clientPtax;
    private final FocusClient clientIpca;
    private static final DateTimeFormatter FORMATO_SGS = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public AtualizacaoService(IndicadorRepository repository,
                              SelicClient client,
                              PtaxClient clientPtax,
                              FocusClient clientIpca) {
        this.repository = repository;
        this.client = client;
        this.clientPtax = clientPtax;
        this.clientIpca = clientIpca;
    }

    public void atualizarSelic() {
        LocalDate inicio = repository.findTopByTipoOrderByDataDesc(TipoIndicador.SELIC)
                .map(selic -> selic.getData().plusDays(1))
                .orElse(LocalDate.now().minusYears(2));
        LocalDate hoje = LocalDate.now();
        if(inicio.isAfter(hoje)){
            return;
        }
        List<SelicBcbDTO> resposta = client.buscarPorPeriodo(inicio.minusDays(1), hoje);

        List<Indicador> novos = new ArrayList<>();
        for (SelicBcbDTO dto : resposta){
            LocalDate data = LocalDate.parse(dto.data(), FORMATO_SGS);
            if (data.isAfter(hoje) || repository.existsByDataAndTipo(data,TipoIndicador.SELIC)){
                continue;
            }
            BigDecimal valor = new BigDecimal(dto.valor());
            Indicador indicador = new Indicador(TipoIndicador.SELIC, data, valor);

            novos.add(indicador);

        }

        repository.saveAll(novos);
    }

    public void atualizarDolar(){
        LocalDate inicio = repository.findTopByTipoOrderByDataDesc(TipoIndicador.DOLAR)
                .map(ultimo -> ultimo.getData().plusDays(1))
                .orElse(LocalDate.now().minusYears(2));
        LocalDate hoje = LocalDate.now();
        if (inicio.isAfter(hoje)){
            return;
        }

        List<PtaxBcbDTO> resposta = clientPtax.cotacaoDolarPeriodo(inicio, hoje);
        List<Indicador> novosPtax = new ArrayList<>();
        Set<LocalDate> datasAdicionadas = new HashSet<>();


        for (PtaxBcbDTO dto : resposta){
            String textoData = dto.dataHoraCotacao().substring( 0, 10 );
            LocalDate data = LocalDate.parse(textoData);
            if (data.isAfter(hoje) || repository.existsByDataAndTipo(data, TipoIndicador.DOLAR)){
                continue;
            }
            Indicador indicador = new Indicador(TipoIndicador.DOLAR, data, dto.cotacaoVenda());
            if (datasAdicionadas.contains(data)){
                continue;
            }else{
                datasAdicionadas.add(data);
            }
            novosPtax.add(indicador);
        }
        repository.saveAll(novosPtax);

    }

    public void atualizarIpcaEsperado(){
        LocalDate inicio = repository.findTopByTipoOrderByDataDesc(TipoIndicador.IPCA_ESPERADO_12M)
                .map(ultimo -> ultimo.getData().plusDays(1))
                .orElse(LocalDate.now().minusYears(2));
        LocalDate hoje = LocalDate.now();
        if (inicio.isAfter(hoje)) {
            return;
        }
        List<FocusBcbDTO> resposta = clientIpca.ipcaPedido(inicio);
        List<Indicador> novosIPCA = new ArrayList<>();
        Set<LocalDate> datasAdicionadas = new HashSet<>();


        for (FocusBcbDTO dto : resposta){
            LocalDate data = LocalDate.parse(dto.data());
            if (data.isAfter(hoje) || repository.existsByDataAndTipo(data, TipoIndicador.IPCA_ESPERADO_12M)){
                continue;
            }
            Indicador indicador = new Indicador(TipoIndicador.IPCA_ESPERADO_12M, data, dto.mediana());
            if (datasAdicionadas.contains(data)){
                continue;
            }else{
                datasAdicionadas.add(data);
            }
            novosIPCA.add(indicador);
        }
        repository.saveAll(novosIPCA);
    }

    public void atualizarEuro(){
        LocalDate inicio = repository.findTopByTipoOrderByDataDesc(TipoIndicador.EURO)
                .map(ultimo -> ultimo.getData().plusDays(1))
                .orElse(LocalDate.now().minusYears(2));
        LocalDate hoje = LocalDate.now();
        if (inicio.isAfter(hoje)){
            return;
        }

        List<PtaxBcbDTO> resposta = clientPtax.buscarMoedaPeriodo("EUR",inicio, hoje);
        List<Indicador> novosPtax = new ArrayList<>();
        Set<LocalDate> datasAdicionadas = new HashSet<>();


        for (PtaxBcbDTO dto : resposta){
            String textoData = dto.dataHoraCotacao().substring( 0, 10 );
            LocalDate data = LocalDate.parse(textoData);
        if (data.isAfter(hoje) || repository.existsByDataAndTipo(data, TipoIndicador.EURO)){
                continue;
            }
        Indicador indicador = new Indicador(TipoIndicador.EURO, data, dto.cotacaoVenda());
            if (datasAdicionadas.contains(data)){
                continue;
            }else{
                datasAdicionadas.add(data);
            }
            novosPtax.add(indicador);
        }
        repository.saveAll(novosPtax);

    }

    public void atualizarIpca() {
        LocalDate inicio = repository.findTopByTipoOrderByDataDesc(TipoIndicador.IPCA)
                .map(ipca -> ipca.getData())
                .orElse(LocalDate.now().minusYears(2));
        LocalDate hoje = LocalDate.now();
        if (inicio.isAfter(hoje)) {
            return;
        }
        List<SelicBcbDTO> resposta = client.buscarSeriePorPeriodo(433, inicio, hoje);
        List<Indicador> novos = new ArrayList<>();
        for (SelicBcbDTO dto : resposta) {
            LocalDate data = LocalDate.parse(dto.data(), FORMATO_SGS);
            if (data.isAfter(hoje) || repository.existsByDataAndTipo(data, TipoIndicador.IPCA)) {
                continue;
            }
            BigDecimal valor = new BigDecimal(dto.valor());
            Indicador indicador = new Indicador(TipoIndicador.IPCA, data, valor);

            novos.add(indicador);

        }

        repository.saveAll(novos);
    }

    @CacheEvict(value = {"selicAtual",
            "selicHistorico",
            "dolarAtual",
            "dolarHistorico",
            "euroAtual",
            "euroHistorico",
            "juroReal",
            "dolarVariacao"}, allEntries = true)
    public void atualizarTudo(){
        atualizarSelic();
        atualizarDolar();
        atualizarIpcaEsperado();
        atualizarEuro();
        atualizarIpca();
    }

}
