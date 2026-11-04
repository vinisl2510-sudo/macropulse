import type { ChartData, ChartOptions } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useCoresGrafico } from '../hooks/useCoresGrafico'
import type { ResultadoInvestimentoDTO } from '../types/api'
import { formatarMoeda, formatarMoedaCompacta } from '../utils/formatacao'
import { opcoesComuns } from './configuracaoGrafico'

type Props = {
  resultados: ResultadoInvestimentoDTO[]
}

/**
 * Barras deitadas: os nomes ficam legíveis no celular, onde "CDB 110% do CDI" não
 * caberia embaixo de uma barra em pé. O eixo começa em zero, como toda barra deve.
 */
export function GraficoComparacao({ resultados }: Props) {
  const cores = useCoresGrafico()
  const comuns = opcoesComuns(cores)

  const data: ChartData<'bar'> = {
    labels: resultados.map((resultado) => resultado.produto),
    datasets: [
      {
        label: 'Valor líquido',
        data: resultados.map((resultado) => resultado.valorLiquido),
        backgroundColor: cores.serie1,
        hoverBackgroundColor: cores.serie1Forte,
      },
      {
        label: 'Valor bruto',
        data: resultados.map((resultado) => resultado.valorBruto),
        backgroundColor: cores.serie2,
        hoverBackgroundColor: cores.serie2Forte,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    ...comuns,
    indexAxis: 'y',
    interaction: { mode: 'index', axis: 'y', intersect: false },
    datasets: {
      bar: { maxBarThickness: 20, borderRadius: 4, borderSkipped: 'start', categoryPercentage: 0.7, barPercentage: 0.9 },
    },
    plugins: {
      tooltip: {
        ...comuns.plugins.tooltip,
        callbacks: {
          label: (item) => `${formatarMoeda(item.parsed.x ?? 0)} ${String(item.dataset.label).toLowerCase()}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: cores.grade },
        border: { display: false },
        ticks: {
          color: cores.textoSuave,
          maxTicksLimit: 5,
          callback: (valor) => formatarMoedaCompacta(Number(valor)),
        },
      },
      y: {
        grid: { display: false },
        border: { color: cores.grade },
        ticks: { color: cores.texto },
      },
    },
  }

  const descricao = resultados
    .map((resultado) => `${resultado.produto}: líquido ${formatarMoeda(resultado.valorLiquido)}, bruto ${formatarMoeda(resultado.valorBruto)}`)
    .join('; ')

  return (
    <div className="cartao comparacao">
      <div className="comparacao__topo">
        <h3>Comparação</h3>
        {/* Legenda em HTML: quando há duas séries, a cor nunca fica sem nome */}
        <ul className="legenda">
          <li>
            <span className="legenda__cor legenda__cor--1" aria-hidden="true" />
            Valor líquido
          </li>
          <li>
            <span className="legenda__cor legenda__cor--2" aria-hidden="true" />
            Valor bruto
          </li>
        </ul>
      </div>
      <div className="grafico" style={{ height: `${5 + resultados.length * 4.5}rem` }}>
        <Bar data={data} options={options} role="img" aria-label={`Comparação de valores. ${descricao}.`} />
      </div>
    </div>
  )
}
