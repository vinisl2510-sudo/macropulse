import { useEffect, useState } from 'react'
import { ErroApi } from '../api/cliente'

type Resultado<T> =
  | { chave: string; dados: T; erro?: undefined }
  | { chave: string; dados?: undefined; erro: ErroApi }

export type EstadoDados<T> =
  | { status: 'carregando'; dados?: undefined; erro?: undefined; tentarNovamente: () => void }
  | { status: 'erro'; dados?: undefined; erro: ErroApi; tentarNovamente: () => void }
  | { status: 'sucesso'; dados: T; erro?: undefined; tentarNovamente: () => void }

/**
 * Busca dados quando a tela aparece e sempre que `chave` muda.
 *
 * O estado "carregando" não é guardado: é calculado. Se o último resultado é de
 * outra chave, ainda estamos esperando. Isso evita mostrar por um instante os
 * dados do período anterior depois de trocar o filtro.
 */
export function useDados<T>(
  buscar: (signal: AbortSignal) => Promise<T>,
  chave: string,
): EstadoDados<T> {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)
  const [tentativa, setTentativa] = useState(0)
  const chaveCompleta = `${chave}#${tentativa}`

  useEffect(() => {
    // Cancela o pedido em andamento se a chave mudar ou a tela sair
    const controle = new AbortController()

    buscar(controle.signal)
      .then((dados) => setResultado({ chave: chaveCompleta, dados }))
      .catch((erro: unknown) => {
        if (controle.signal.aborted) return
        const erroApi =
          erro instanceof ErroApi ? erro : new ErroApi(0, 'Algo inesperado aconteceu ao buscar os dados.')
        setResultado({ chave: chaveCompleta, erro: erroApi })
      })

    return () => controle.abort()
    // `buscar` muda a cada renderização: quem define quando buscar de novo é a chave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveCompleta])

  const tentarNovamente = () => setTentativa((atual) => atual + 1)

  if (resultado?.chave !== chaveCompleta) {
    return { status: 'carregando', tentarNovamente }
  }
  if (resultado.erro) {
    return { status: 'erro', erro: resultado.erro, tentarNovamente }
  }
  return { status: 'sucesso', dados: resultado.dados, tentarNovamente }
}
