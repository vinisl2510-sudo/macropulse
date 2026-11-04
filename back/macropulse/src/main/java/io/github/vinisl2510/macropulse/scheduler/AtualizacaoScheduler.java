package io.github.vinisl2510.macropulse.scheduler;

import io.github.vinisl2510.macropulse.service.AtualizacaoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AtualizacaoScheduler {

    @Value("${macropulse.atualizacao.na-inicializacao:true}")
    private boolean atualizacaoInicialLigada;
    private final AtualizacaoService atualizacaoService;
    public AtualizacaoScheduler(AtualizacaoService atualizacaoService) {
        this.atualizacaoService = atualizacaoService;
    }

    @Scheduled(cron = "0 0 18 * * MON-FRI", zone = "America/Sao_Paulo")
    public void atualizacaoDiaria(){
        log.info( "Atualização diária iniciada..." );
        try {
            atualizacaoService.atualizarTudo();
            log.info("Atualizaçao diaria concluida!");
        } catch (Exception e) {
            log.error("Falha na atualização diária", e);
        }

    }

    @EventListener(ApplicationReadyEvent.class)
    public void atualizarNaInicializacao(){
        if (!atualizacaoInicialLigada) {
            log.info("Atualização na inicialização desligada por configuração");
            return;
        }
        log.info( "Aplicação iniciada: buscando os dias que faltam" );
        try {
            atualizacaoService.atualizarTudo();
            log.info("Atualização na inicialização concluída");
        } catch (Exception e) {
            log.error("Falha na atualização na inicialização", e);
        }
    }
}
