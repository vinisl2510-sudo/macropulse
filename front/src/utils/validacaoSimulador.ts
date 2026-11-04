import type { SimulacaoRequestDTO } from '../types/api'

export type CamposSimulador = {
  valor: string
  prazo: string
  percentual: string
}

export type ErrosSimulador = Partial<Record<keyof CamposSimulador | 'produtos', string>>

// A API aceita qualquer número positivo. Estes limites são só do front: evitam
// resultados com dezenas de dígitos, que não significam nada e quebram a tela.
const VALOR_MAXIMO = 1_000_000_000
const PRAZO_MAXIMO_DIAS = 18_250 // 50 anos
const PERCENTUAL_MAXIMO = 500

function validarPositivo(texto: string, nome: string, maximo: number, limite: string): string | undefined {
  if (texto.trim() === '') return `Informe ${nome}.`
  const numero = Number(texto)
  if (!Number.isFinite(numero) || numero <= 0) return `Informe ${nome} maior que zero.`
  if (numero > maximo) return `O máximo é ${limite}.`
  return undefined
}

/** Devolve os erros encontrados. Sem nenhum erro, o formulário pode ser enviado. */
export function validarSimulador(campos: CamposSimulador, algumProdutoEscolhido: boolean): ErrosSimulador {
  const erros: ErrosSimulador = {
    valor: validarPositivo(campos.valor, 'o valor', VALOR_MAXIMO, 'R$ 1 bilhão'),
    prazo: validarPositivo(campos.prazo, 'o prazo', PRAZO_MAXIMO_DIAS, '18.250 dias (50 anos)'),
    percentual: validarPositivo(campos.percentual, 'o percentual do CDI', PERCENTUAL_MAXIMO, '500%'),
    produtos: algumProdutoEscolhido ? undefined : 'Escolha pelo menos um investimento.',
  }

  // A API truncaria 1,5 para 1 sem avisar: melhor pedir um número inteiro
  if (!erros.prazo && !Number.isInteger(Number(campos.prazo))) {
    erros.prazo = 'Informe o prazo em dias inteiros.'
  }

  return erros
}

export function temErros(erros: ErrosSimulador): boolean {
  return Object.values(erros).some(Boolean)
}

export function paraRequisicao(campos: CamposSimulador): SimulacaoRequestDTO {
  return {
    valor: Number(campos.valor),
    prazoDias: Number(campos.prazo),
    percentualCdi: Number(campos.percentual),
  }
}
