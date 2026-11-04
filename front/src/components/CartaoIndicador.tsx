import type { ErroApi } from '../api/cliente'
import type { Tendencia } from '../utils/tendencia'
import { Carregando, EstadoVazio, MensagemErro } from './Estados'

export type ConteudoCartao = {
  valor: string
  /** Data de referência, já formatada. */
  referencia: string
  tendencia?: Tendencia
  /** Texto de apoio abaixo da tendência. */
  nota?: string
}

type Props = {
  titulo: string
  descricao: string
  status: 'carregando' | 'erro' | 'sucesso'
  conteudo?: ConteudoCartao
  erro?: ErroApi
  aoTentarNovamente?: () => void
}

function SetaTendencia({ direcao }: { direcao: Tendencia['direcao'] }) {
  return (
    <svg className="tendencia__seta" viewBox="0 0 12 12" aria-hidden="true">
      {direcao === 'alta' && <path d="M6 2 11 10H1Z" />}
      {direcao === 'queda' && <path d="M6 10 1 2H11Z" />}
      {direcao === 'estavel' && <path d="M1 5h10v2H1Z" />}
    </svg>
  )
}

export function CartaoIndicador({ titulo, descricao, status, conteudo, erro, aoTentarNovamente }: Props) {
  return (
    <article className="cartao indicador">
      <h3>{titulo}</h3>
      <p className="indicador__descricao">{descricao}</p>

      {status === 'carregando' && <Carregando texto="Carregando..." />}
      {status === 'erro' && erro && <MensagemErro erro={erro} aoTentarNovamente={aoTentarNovamente} />}
      {status === 'sucesso' && !conteudo && <EstadoVazio texto="Ainda não há dados deste indicador." />}

      {status === 'sucesso' && conteudo && (
        <>
          <p className="indicador__valor">{conteudo.valor}</p>
          <p className="indicador__referencia">{conteudo.referencia}</p>
          {conteudo.tendencia && (
            // A seta e o texto dizem o mesmo que a cor: ninguém depende só de enxergar verde ou vermelho
            <p className={`tendencia tendencia--${conteudo.tendencia.direcao}`}>
              <SetaTendencia direcao={conteudo.tendencia.direcao} />
              {conteudo.tendencia.texto}
            </p>
          )}
          {conteudo.nota && <p className="indicador__nota">{conteudo.nota}</p>}
        </>
      )}
    </article>
  )
}
