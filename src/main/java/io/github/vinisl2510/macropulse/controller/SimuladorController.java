package io.github.vinisl2510.macropulse.controller;

import io.github.vinisl2510.macropulse.dto.request.SimulacaoRequestDTO;
import io.github.vinisl2510.macropulse.dto.response.SimulacaoResponseDTO;
import io.github.vinisl2510.macropulse.service.SimuladorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Simulador", description = "Simulação de rendimento em CDB, Tesouro Selic e poupança, com IR regressivo")
@RestController
@RequestMapping("/api/simulador")
public class SimuladorController {
    private final SimuladorService simuladorService;

    public SimuladorController(SimuladorService simuladorService) {
        this.simuladorService = simuladorService;
    }

    @Operation(summary = "Simula investimentos", description = "Compara o rendimento líquido de CDB, Tesouro Selic e poupança para um valor, um prazo em dias e um % do CDI, usando a Selic mais recente")
    @PostMapping
    public SimulacaoResponseDTO simular(@Valid @RequestBody SimulacaoRequestDTO request) {
        return simuladorService.simular(request);
    }
}
