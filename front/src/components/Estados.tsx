import type { ErroApi } from '../api/cliente'

// Os três estados de qualquer lugar que busca dados: carregando, erro e vazio.

export function Carregando({ texto = 'Carregando dados...' }: { texto?: string }) {
  return (
    <div className="estado" role="status">
      <span className="estado__girando" aria-hidden="true" />
      {texto}
    </div>
  )
}

type PropsErro = {
  erro: ErroApi
  aoTentarNovamente?: () => void
}

export function MensagemErro({ erro, aoTentarNovamente }: PropsErro) {
  return (
    <div className="estado estado--erro" role="alert">
      <p className="estado__titulo">{erro.message}</p>
      {erro.detalhe && <p className="estado__detalhe">{erro.detalhe}</p>}
      {aoTentarNovamente && (
        <button type="button" className="botao botao--discreto" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EstadoVazio({ texto }: { texto: string }) {
  return <div className="estado">{texto}</div>
}
