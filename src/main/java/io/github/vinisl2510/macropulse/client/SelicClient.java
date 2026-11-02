package io.github.vinisl2510.macropulse.client;

import io.github.vinisl2510.macropulse.dto.bcb.SelicBcbDTO;
import io.github.vinisl2510.macropulse.exception.BcbIndisponivelException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class SelicClient {
    private final RestClient restClient;
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public SelicClient(RestClient restClient) {

        this.restClient = restClient;
    }

    @Retryable(includes = BcbIndisponivelException.class, maxRetries = 3, delay = 2000)
    public List<SelicBcbDTO> buscarPorPeriodo (LocalDate inicio,LocalDate fim) {
        try {
            return restClient.get()
                    .uri("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial={inicio}&dataFinal={fim}"
                            , DATA.format(inicio), DATA.format(fim))
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<SelicBcbDTO>>() {
                    });
        } catch (RestClientException e) {
            throw new BcbIndisponivelException("Não foi possível consultar a Selic no Banco Central", e);
        }
    }

    @Retryable(includes = BcbIndisponivelException.class, maxRetries = 3, delay = 2000)
    public List<SelicBcbDTO> buscarSeriePorPeriodo(int serie, LocalDate inicio, LocalDate fim){
        try{
        return restClient.get()
                .uri("https://api.bcb.gov.br/dados/serie/bcdata.sgs.{serie}/dados?formato=json&dataInicial={inicio}&dataFinal={fim}"
                        , serie, DATA.format(inicio), DATA.format(fim))
                .retrieve()
                .body(new ParameterizedTypeReference<List<SelicBcbDTO>>() {
                });
    } catch (RestClientException e) {
        throw new BcbIndisponivelException("Não foi possível consultar a série " + serie + " do SGS", e);
        }
    }
}
