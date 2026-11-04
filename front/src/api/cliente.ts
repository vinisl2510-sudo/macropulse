import type { ProblemDetail } from '../types/api'

/**
 * Erro padronizado do front. Qualquer falha ao chamar a API vira um ErroApi,
 * assim as telas só precisam saber lidar com um único formato.
 */
export class ErroApi extends Error {
  /** Status HTTP. Vale 0 quando a resposta nem chegou (sem conexão). */
  status: number
  /** Texto do campo `detail` da API, quando existe. */
  detalhe?: string

  constructor(status: number, mensagem: string, detalhe?: string) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
    this.detalhe = detalhe
  }
}

function mensagemAmigavel(status: number): string {
  switch (status) {
    case 0:
      return 'Não foi possível conectar à API. Confira se ela está no ar.'
    case 400:
      return 'Os dados enviados não são válidos.'
    case 404:
      return 'Ainda não há dados disponíveis para esta consulta.'
    case 503:
      return 'O Banco Central está indisponível no momento. Tente novamente em instantes.'
    default:
      return 'A API não conseguiu responder agora. Tente novamente em instantes.'
  }
}

/** Faz a chamada e converte qualquer falha em ErroApi. */
async function requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response

  try {
    resposta = await fetch(caminho, opcoes)
  } catch (erro) {
    // Cancelamento proposital (a tela mudou): não é um erro para mostrar
    if (erro instanceof DOMException && erro.name === 'AbortError') {
      throw erro
    }
    throw new ErroApi(0, mensagemAmigavel(0))
  }

  if (!resposta.ok) {
    // Nem toda falha traz JSON: um proxy com a API fora do ar devolve HTML ou nada
    const problema = (await resposta.json().catch(() => null)) as Partial<ProblemDetail> | null
    throw new ErroApi(resposta.status, mensagemAmigavel(resposta.status), problema?.detail)
  }

  try {
    return (await resposta.json()) as T
  } catch {
    throw new ErroApi(resposta.status, 'A API respondeu em um formato inesperado.')
  }
}

/** GET com parâmetros na URL. Os caminhos são relativos: veja o proxy em vite.config.ts. */
export function get<T>(
  caminho: string,
  parametros?: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  const consulta = new URLSearchParams()
  Object.entries(parametros ?? {}).forEach(([nome, valor]) => consulta.set(nome, String(valor)))
  const url = consulta.size > 0 ? `${caminho}?${consulta}` : caminho

  return requisitar<T>(url, { signal })
}

/** POST com corpo em JSON. */
export function post<T>(caminho: string, corpo: unknown, signal?: AbortSignal): Promise<T> {
  return requisitar<T>(caminho, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
    signal,
  })
}
