import type { CotacaoDTO, JuroRealDTO, VariacaoDTO } from '../types/api'
import { get } from './cliente'

const BASE = '/api/indicadores'

/** Indicadores com endpoint `/atual`. O IPCA não tem: usa-se o último item do histórico. */
export type IndicadorComAtual = 'selic' | 'dolar' | 'euro'
export type IndicadorComHistorico = IndicadorComAtual | 'ipca'

export function buscarAtual(indicador: IndicadorComAtual, signal?: AbortSignal) {
  return get<CotacaoDTO>(`${BASE}/${indicador}/atual`, undefined, signal)
}

export function buscarHistorico(
  indicador: IndicadorComHistorico,
  inicio: string,
  fim: string,
  signal?: AbortSignal,
) {
  return get<CotacaoDTO[]>(`${BASE}/${indicador}/historico`, { inicio, fim }, signal)
}

export function buscarVariacaoDolar(dias: number, signal?: AbortSignal) {
  return get<VariacaoDTO>(`${BASE}/dolar/variacao`, { dias }, signal)
}

export function buscarJuroReal(signal?: AbortSignal) {
  return get<JuroRealDTO>(`${BASE}/juro-real`, undefined, signal)
}
