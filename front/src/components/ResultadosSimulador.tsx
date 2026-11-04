import type { ResultadoInvestimentoDTO, SimulacaoResponseDTO } from '../types/api'
import { formatarMoeda, formatarTaxa } from '../utils/formatacao'
import { GraficoComparacao } from './GraficoComparacao'

function CartaoResultado({ resultado, melhor }: { resultado: ResultadoInvestimentoDTO; melhor: boolean }) {
  return (
    <article className={`cartao resultado ${melhor ? 'resultado--melhor' : ''}`}>
      <div className="resultado__topo">
        <h3>{resultado.produto}</h3>
        {/* O selo escrito garante que o destaque não depende só da cor da borda */}
        {melhor && <span className="selo">Melhor valor líquido</span>}
      </div>
      <p className="resultado__valor">{formatarMoeda(resultado.valorLiquido)}</p>
      <p className="resultado__legenda">valor líquido</p>
      <dl className="resultado__detalhes">
        <div>
          <dt>Valor bruto</dt>
          <dd>{formatarMoeda(resultado.valorBruto)}</dd>
        </div>
        <div>
          <dt>Imposto de renda</dt>
          <dd>{formatarMoeda(resultado.impostoRenda)}</dd>
        </div>
        <div>
          <dt>Rendimento líquido</dt>
          <dd>{formatarMoeda(resultado.rendimentoLiquido)}</dd>
        </div>
      </dl>
    </article>
  )
}

type Props = {
  simulacao: SimulacaoResponseDTO
  /** Só os investimentos marcados nos checkboxes. */
  resultados: ResultadoInvestimentoDTO[]
}

export function ResultadosSimulador({ simulacao, resultados }: Props) {
  const maiorLiquido = Math.max(...resultados.map((resultado) => resultado.valorLiquido))

  return (
    <div className="resultados">
      <p className="resultados__resumo">
        {formatarMoeda(simulacao.valorInvestido)} por {simulacao.prazoDias} {simulacao.prazoDias === 1 ? 'dia' : 'dias'},
        com <strong>Selic de {formatarTaxa(simulacao.selicUsada)} ao ano</strong>.
      </p>

      <div className="resultados__cartoes">
        {resultados.map((resultado) => (
          <CartaoResultado
            key={resultado.produto}
            resultado={resultado}
            // Com um investimento só, não há o que comparar
            melhor={resultados.length > 1 && resultado.valorLiquido === maiorLiquido}
          />
        ))}
      </div>

      <GraficoComparacao resultados={resultados} />
    </div>
  )
}
