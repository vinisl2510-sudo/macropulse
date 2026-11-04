import type { SimulacaoRequestDTO, SimulacaoResponseDTO } from '../types/api'
import { ErroApi, post } from './cliente'

const NOMES_DOS_CAMPOS: Record<string, string> = {
  valor: 'Valor',
  prazoDias: 'Prazo',
  percentualCdi: '% do CDI',
}

/** O erro 400 cita os campos como no Java ("prazoDias: ..."): troca pelos nomes da tela. */
function traduzirCampos(detalhe: string): string {
  return detalhe.replace(/\b(valor|prazoDias|percentualCdi):/g, (_trecho, campo: string) => `${NOMES_DOS_CAMPOS[campo]}:`)
}

export async function simular(dados: SimulacaoRequestDTO, signal?: AbortSignal) {
  try {
    return await post<SimulacaoResponseDTO>('/api/simulador', dados, signal)
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 400 && erro.detalhe) {
      throw new ErroApi(erro.status, erro.message, traduzirCampos(erro.detalhe))
    }
    throw erro
  }
}
