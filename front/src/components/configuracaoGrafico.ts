import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type Plugin,
} from 'chart.js'
import type { CoresGrafico } from '../hooks/useCoresGrafico'

// O Chart.js só inclui no site as peças registradas aqui. Isso reduz o tamanho final.
ChartJS.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip)

ChartJS.defaults.font.family = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
ChartJS.defaults.font.size = 12

/** Linha vertical que acompanha o mouse, para achar a data sem mirar em uma linha fina. */
export const linhaVertical: Plugin = {
  id: 'linhaVertical',
  afterDatasetsDraw(chart) {
    const ativos = chart.tooltip?.getActiveElements()
    if (!ativos?.length) return

    const { ctx, chartArea } = chart
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(ativos[0].element.x, chartArea.top)
    ctx.lineTo(ativos[0].element.x, chartArea.bottom)
    ctx.lineWidth = 1
    // Reaproveita a cor do texto do eixo, que já acompanha o tema
    ctx.strokeStyle = String(chart.options.scales?.x?.ticks?.color ?? '#888')
    ctx.stroke()
    ctx.restore()
  },
}

/** Partes iguais em todos os gráficos: sem animação, grade discreta e tooltip no tema do site. */
export function opcoesComuns(cores: CoresGrafico) {
  return {
    responsive: true,
    // Quem manda na altura é o CSS (.grafico)
    maintainAspectRatio: false,
    animation: false as const,
    locale: 'pt-BR',
    plugins: {
      tooltip: {
        backgroundColor: cores.superficie,
        titleColor: cores.textoSuave,
        bodyColor: cores.texto,
        borderColor: cores.borda,
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        bodyFont: { weight: 'bold' as const },
      },
    },
  }
}
