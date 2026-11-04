import type { CotacaoDTO } from '../types/api'
import { formatarNumero } from './formatacao'

export type Tendencia = {
  direcao: 'alta' | 'queda' | 'estavel'
  texto: string
}

function montar(variacao: number, unidade: string): Tendencia {
  // Compara já arredondado: uma diferença que aparece como 0,00 é estabilidade
  const arredondada = Math.round(Math.abs(variacao) * 100) / 100
  if (arredondada === 0) {
    return { direcao: 'estavel', texto: 'Sem variação' }
  }
  return variacao > 0
    ? { direcao: 'alta', texto: `Alta de ${formatarNumero(arredondada)}${unidade}` }
    : { direcao: 'queda', texto: `Queda de ${formatarNumero(arredondada)}${unidade}` }
}

/** Para preços (dólar e euro): variação percentual. */
export function compararPreco(atual: number, anterior: number): Tendencia {
  return montar(((atual - anterior) / anterior) * 100, '%')
}

/**
 * Para taxas (Selic e IPCA): diferença em pontos percentuais (p.p.). Se a Selic vai
 * de 14% para 13,75%, a queda é de 0,25 p.p.; dizer "1,79%" confundiria.
 */
export function compararTaxa(atual: number, anterior: number): Tendencia {
  return montar(atual - anterior, ' p.p.')
}

/** Último ponto com data anterior à informada. */
export function pontoAnterior(historico: CotacaoDTO[], data: string): CotacaoDTO | undefined {
  // As datas "yyyy-MM-dd" podem ser comparadas como texto
  return historico.filter((ponto) => ponto.data < data).at(-1)
}

/**
 * A Selic é publicada todo dia e fica igual por semanas. Comparar com a véspera
 * diria sempre "sem variação", então procura a última vez em que o valor mudou.
 * Devolve o valor antigo e a data em que o valor atual começou a valer.
 */
export function ultimaMudanca(historico: CotacaoDTO[]): { anterior: number; desde: string } | undefined {
  for (let i = historico.length - 1; i > 0; i--) {
    if (historico[i - 1].valor !== historico[i].valor) {
      return { anterior: historico[i - 1].valor, desde: historico[i].data }
    }
  }
  return undefined
}
