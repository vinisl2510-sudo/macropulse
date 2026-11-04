import { useState } from 'react'
import { buscarHistorico, type IndicadorComHistorico } from '../api/indicadores'
import { useDados } from '../hooks/useDados'
import { mesesAtras, paraIso, primeiroDiaDoMes } from '../utils/datas'
import {
  formatarCotacao,
  formatarData,
  formatarDiaMes,
  formatarMesAno,
  formatarMesAnoLongo,
  formatarMoeda,
  formatarTaxa,
} from '../utils/formatacao'
import { Carregando, EstadoVazio, MensagemErro } from './Estados'
import { GraficoHistorico } from './GraficoHistorico'
import { TabelaDados } from './TabelaDados'

const PERIODOS = [
  { id: '1M', meses: 1, nome: '1 mês' },
  { id: '6M', meses: 6, nome: '6 meses' },
  { id: '1A', meses: 12, nome: '1 ano' },
  { id: '2A', meses: 24, nome: '2 anos' },
] as const

type Periodo = (typeof PERIODOS)[number]

type PropsCartao = {
  indicador: IndicadorComHistorico
  titulo: string
  subtitulo: string
  tipo: 'linha' | 'escada' | 'barras'
  periodo: Periodo
  formatarValor: (valor: number) => string
  formatarEixoY: (valor: number) => string
}

// O último dado do IPCA costuma ter mais de um mês: em 1M, o intervalo viria vazio
const MESES_IPCA_EM_1M = 3

function CartaoGrafico({ indicador, titulo, subtitulo, tipo, periodo, formatarValor, formatarEixoY }: PropsCartao) {
  const mensal = indicador === 'ipca'
  const ipcaCurto = mensal && periodo.id === '1M'

  const estado = useDados(async (signal) => {
    // Dados mensais têm data no dia 01: começar nele evita perder o primeiro mês
    const inicio = mensal ? primeiroDiaDoMes(mesesAtras(ipcaCurto ? 6 : periodo.meses)) : mesesAtras(periodo.meses)
    const pontos = await buscarHistorico(indicador, paraIso(inicio), paraIso(new Date()), signal)
    return ipcaCurto ? pontos.slice(-MESES_IPCA_EM_1M) : pontos
  }, `${indicador}-${periodo.id}`)

  const pontos = estado.dados ?? estado.dadosAnteriores
  const ultimo = pontos?.at(-1)
  const carregandoComDados = estado.status === 'carregando' && pontos !== undefined
  const formatarDataPonto = mensal ? formatarMesAnoLongo : formatarData
  const formatarEixoX = mensal || periodo.meses >= 12 ? formatarMesAno : formatarDiaMes

  return (
    <article className="cartao cartao-grafico" aria-busy={estado.status === 'carregando'}>
      <header className="cartao-grafico__topo">
        <div>
          <h3>{titulo}</h3>
          <p className="cartao-grafico__subtitulo">{subtitulo}</p>
        </div>
        {ultimo && (
          <p className="cartao-grafico__ultimo">
            <strong>{formatarValor(ultimo.valor)}</strong>
            <span>{formatarDataPonto(ultimo.data)}</span>
          </p>
        )}
      </header>

      {estado.status === 'erro' && <MensagemErro erro={estado.erro} aoTentarNovamente={estado.tentarNovamente} />}
      {estado.status === 'carregando' && !pontos && (
        <div className="grafico">
          <Carregando />
        </div>
      )}
      {pontos && pontos.length === 0 && (
        <div className="grafico">
          <EstadoVazio texto={`Não há dados de ${titulo} neste período.`} />
        </div>
      )}
      {pontos && pontos.length > 0 && (
        // Ao trocar de período, o gráfico antigo fica esmaecido: a tela não pula nem pisca
        <div className={carregandoComDados ? 'esmaecido' : undefined}>
          <GraficoHistorico
            tipo={tipo}
            pontos={pontos}
            descricao={`${titulo}: ${pontos.length} registros, de ${formatarDataPonto(pontos[0].data)} a ${formatarDataPonto(pontos[pontos.length - 1].data)}. Último valor: ${formatarValor(pontos[pontos.length - 1].valor)}.`}
            formatarValor={formatarValor}
            formatarEixoY={formatarEixoY}
            formatarEixoX={formatarEixoX}
            formatarDataTooltip={formatarDataPonto}
          />
          {ipcaCurto && (
            <p className="cartao-grafico__nota">
              O IPCA é mensal e demora para ser divulgado. Em 1M, mostramos os {MESES_IPCA_EM_1M} últimos meses disponíveis.
            </p>
          )}
          <TabelaDados pontos={pontos} formatarValor={formatarValor} formatarData={formatarDataPonto} />
        </div>
      )}
    </article>
  )
}

export function PainelGraficos() {
  const [periodo, setPeriodo] = useState<Periodo>(PERIODOS[2])

  return (
    <>
      <div className="seletor-periodo" role="group" aria-label="Período dos gráficos">
        {PERIODOS.map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            aria-pressed={opcao.id === periodo.id}
            aria-label={opcao.nome}
            onClick={() => setPeriodo(opcao)}
          >
            {opcao.id}
          </button>
        ))}
      </div>

      <div className="grade-graficos">
        <CartaoGrafico
          indicador="selic"
          titulo="Selic"
          subtitulo="% ao ano"
          tipo="escada"
          periodo={periodo}
          formatarValor={formatarTaxa}
          formatarEixoY={formatarTaxa}
        />
        <CartaoGrafico
          indicador="ipca"
          titulo="IPCA"
          subtitulo="% no mês"
          tipo="barras"
          periodo={periodo}
          formatarValor={formatarTaxa}
          formatarEixoY={formatarTaxa}
        />
        <CartaoGrafico
          indicador="dolar"
          titulo="Dólar"
          subtitulo="Venda, em reais"
          tipo="linha"
          periodo={periodo}
          formatarValor={formatarCotacao}
          formatarEixoY={formatarMoeda}
        />
        <CartaoGrafico
          indicador="euro"
          titulo="Euro"
          subtitulo="Venda, em reais"
          tipo="linha"
          periodo={periodo}
          formatarValor={formatarCotacao}
          formatarEixoY={formatarMoeda}
        />
      </div>
    </>
  )
}
