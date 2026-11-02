package io.github.vinisl2510.macropulse.client;
import io.github.vinisl2510.macropulse.dto.bcb.FocusBcbDTO;
import io.github.vinisl2510.macropulse.dto.bcb.FocusRespostaBcbDTO;
import io.github.vinisl2510.macropulse.exception.BcbIndisponivelException;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.util.List;

@Component
public class FocusClient {
    private final RestClient restClient;

    public FocusClient(RestClient restClient) {
        this.restClient = restClient;
    }

    @Retryable(includes = BcbIndisponivelException.class, maxRetries = 3, delay = 2000)
    public List<FocusBcbDTO> ipcaPedido(LocalDate inicio) {
        try {
            FocusRespostaBcbDTO resposta = restClient.get()
                    .uri("https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses?$filter=Indicador eq 'IPCA' and Suavizada eq 'S' and baseCalculo eq 0 and Data ge '{inicio}'&$orderby=Data asc&$format=json"
                            ,inicio)
                    .retrieve()
                    .body(FocusRespostaBcbDTO.class);
            if (resposta == null){
                return List.of();
            }

            return resposta.value();
        }catch (RestClientException e){
            throw new BcbIndisponivelException("Não foi possível consultar a cotação do IPCA no Banco Central", e);
        }
    }
}
