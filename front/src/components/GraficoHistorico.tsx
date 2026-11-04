import type { ChartData, ChartOptions } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { useCoresGrafico } from '../hooks/useCoresGrafico'
import type { CotacaoDTO } from '../types/api'
import { linhaVertical, opcoesComuns } from './configuracaoGrafico'

type Props = {
  /** escada: para a Selic, que fica igual e muda de uma vez. barras: para dados mensais. */
  tipo: 'linha' | 'escada' | 'barras'
  pontos: CotacaoDTO[]
  /** Descrição do gráfico para leitores de tela, já que o canvas é só uma imagem. */
  descricao: string
  formatarValor: (valor: number) => string
  formatarEixoY: (valor: number) => string
  formatarEixoX: (data: string) => string
  formatarDataTooltip: (data: string) => string
}

export function GraficoHistorico({
  tipo,
  pontos,
  descricao,
  formatarValor,
  formatarEixoY,
  formatarEixoX,
  formatarDataTooltip,
}: Props) {
  const cores = useCoresGrafico()
  const comuns = opcoesComuns(cores)
  const datas = pontos.map((ponto) => ponto.data)
  const valores = pontos.map((ponto) => ponto.valor)

  const eixoX = {
    grid: { display: false },
    border: { color: cores.grade },
    ticks: {
      color: cores.textoSuave,
      maxRotation: 0,
      autoSkipPadding: 20,
      callback: (_valor: string | number, indice: number) => formatarEixoX(datas[indice]),
    },
  }

  const eixoY = {
    grid: { color: cores.grade },
    border: { display: false },
    ticks: {
      color: cores.textoSuave,
      maxTicksLimit: 6,
      callback: (valor: string | number) => formatarEixoY(Number(valor)),
    },
  }

  const tooltip = {
    ...comuns.plugins.tooltip,
    callbacks: {
      title: (itens: { dataIndex: number }[]) => formatarDataTooltip(datas[itens[0].dataIndex]),
      label: (item: { parsed: { y: number | null } }) => formatarValor(item.parsed.y ?? 0),
    },
  }

  if (tipo === 'barras') {
    const data: ChartData<'bar'> = {
      labels: datas,
      datasets: [
        {
          data: valores,
          backgroundColor: cores.serie1,
          hoverBackgroundColor: cores.serie1Forte,
          maxBarThickness: 24,
          // O canto reto fica sempre na base, mesmo nas barras negativas
          borderRadius: 4,
          borderSkipped: 'start',
        },
      ],
    }
    const options: ChartOptions<'bar'> = {
      ...comuns,
      interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { ...tooltip, displayColors: false } },
      scales: { x: eixoX, y: eixoY },
    }
    return (
      <div className="grafico">
        <Bar data={data} options={options} role="img" aria-label={descricao} />
      </div>
    )
  }

  const data: ChartData<'line'> = {
    labels: datas,
    datasets: [
      {
        data: valores,
        borderColor: cores.serie1,
        // Sem área pintada: o eixo não começa em zero, e a área sugeriria um tamanho que não existe
        fill: false,
        borderWidth: 2,
        stepped: tipo === 'escada',
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
        tension: 0,
        // Sem marcadores, exceto se houver um ponto só: ele não formaria uma linha
        pointRadius: pontos.length === 1 ? 4 : 0,
        pointBackgroundColor: cores.serie1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: cores.serie1,
        pointHoverBorderColor: cores.superficie,
        pointHoverBorderWidth: 2,
      },
    ],
  }
  const options: ChartOptions<'line'> = {
    ...comuns,
    interaction: { mode: 'index', intersect: false },
    plugins: { tooltip: { ...tooltip, displayColors: false } },
    scales: { x: eixoX, y: { ...eixoY, grace: '5%' } },
  }
  return (
    <div className="grafico">
      <Line data={data} options={options} plugins={[linhaVertical]} role="img" aria-label={descricao} />
    </div>
  )
}
