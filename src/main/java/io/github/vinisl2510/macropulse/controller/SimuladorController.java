package io.github.vinisl2510.macropulse.controller;

import io.github.vinisl2510.macropulse.dto.request.SimulacaoRequestDTO;
import io.github.vinisl2510.macropulse.dto.response.SimulacaoResponseDTO;
import io.github.vinisl2510.macropulse.service.SimuladorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulador")
public class SimuladorController {
    private final SimuladorService simuladorService;

    public SimuladorController(SimuladorService simuladorService) {
        this.simuladorService = simuladorService;
    }

    @PostMapping
    public SimulacaoResponseDTO simular(@Valid @RequestBody SimulacaoRequestDTO request) {
        return simuladorService.simular(request);
    }
}
