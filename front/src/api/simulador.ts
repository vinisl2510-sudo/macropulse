import type { SimulacaoRequestDTO, SimulacaoResponseDTO } from '../types/api'
import { post } from './cliente'

export function simular(dados: SimulacaoRequestDTO, signal?: AbortSignal) {
  return post<SimulacaoResponseDTO>('/api/simulador', dados, signal)
}
