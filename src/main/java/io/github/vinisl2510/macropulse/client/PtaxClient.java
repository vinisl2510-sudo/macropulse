package io.github.vinisl2510.macropulse.client;

import io.github.vinisl2510.macropulse.dto.bcb.PtaxBcbDTO;
import io.github.vinisl2510.macropulse.dto.bcb.PtaxRespostaBcbDTO;
import io.github.vinisl2510.macropulse.dto.bcb.SelicBcbDTO;
import io.github.vinisl2510.macropulse.exception.BcbIndisponivelException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class PtaxClient {
    private final RestClient restClient;
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("MM-dd-yyyy");

    public PtaxClient(RestClient restClient) {

        this.restClient = restClient;
    }

    public List<PtaxBcbDTO> cotacaoDolarPeriodo (LocalDate inicio, LocalDate fim) {
        try {
            PtaxRespostaBcbDTO resposta = restClient.get()
                    .uri("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='{inicio}'&@dataFinalCotacao='{fim}'&$format=json"
                            , DATA.format(inicio), DATA.format(fim))
                    .retrieve()
                    .body(PtaxRespostaBcbDTO.class);
            if (resposta == null){
                return List.of();
            }

            return resposta.value();
        }catch (RestClientException e){
            throw new BcbIndisponivelException("Não foi possível consultar a cotação do dólar no Banco Central", e);
        }
    }

    public List<PtaxBcbDTO> buscarMoedaPeriodo (String moeda, LocalDate inicio, LocalDate fim) {
        try {
            PtaxRespostaBcbDTO resposta = restClient.get()
                    .uri("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='{moeda}'&@dataInicial='{inicio}'&@dataFinalCotacao='{fim}'&$filter=tipoBoletim eq 'Fechamento'&$format=json"
                            ,moeda , DATA.format(inicio), DATA.format(fim))
                    .retrieve()
                    .body(PtaxRespostaBcbDTO.class);
            if (resposta == null){
                return List.of();
            }

            return resposta.value();
        }catch (RestClientException e){
            throw new BcbIndisponivelException("Não foi possível consultar a cotação de " + moeda + " no Banco Central", e);        }
    }

    }
