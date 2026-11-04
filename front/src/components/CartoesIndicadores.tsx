import {
  buscarAtual,
  buscarHistorico,
  buscarJuroReal,
  buscarVariacaoDolar,
  type IndicadorComAtual,
} from '../api/indicadores'
import { useDados } from '../hooks/useDados'
import { diasAtras, mesesAtras, paraIso } from '../utils/datas'
import { formatarCotacao, formatarData, formatarMesAnoLongo, formatarTaxa } from '../utils/formatacao'
import { compararPreco, compararTaxa, pontoAnterior, ultimaMudanca } from '../utils/tendencia'
import { CartaoIndicador, type ConteudoCartao } from './CartaoIndicador'

// Margem para sempre achar o dia útil anterior, mesmo com feriados prolongados
const DIAS_PARA_ACHAR_ANTERIOR = 15

function buscarAtualEHistorico(indicador: IndicadorComAtual, inicio: Date, signal: AbortSignal) {
  return Promise.all([
    buscarAtual(indicador, signal),
    buscarHistorico(indicador, paraIso(inicio), paraIso(new Date()), signal),
  ])
}

function CartaoMoeda({ indicador, titulo, descricao }: { indicador: 'dolar' | 'euro'; titulo: string; descricao: string }) {
  const estado = useDados(
    async (signal) => {
      const [atual, historico] = await buscarAtualEHistorico(indicador, diasAtras(DIAS_PARA_ACHAR_ANTERIOR), signal)
      // A variação de 30 dias é um complemento: se falhar, o card continua útil
      const variacao =
        indicador === 'dolar' ? await buscarVariacaoDolar(30, signal).catch(() => undefined) : undefined
      return { atual, anterior: pontoAnterior(historico, atual.data), variacao }
    },
    `cartao-${indicador}`,
  )

  let conteudo: ConteudoCartao | undefined
  if (estado.status === 'sucesso') {
    const { atual, anterior, variacao } = estado.dados
    const notas = [
      anterior && `Em relação a ${formatarData(anterior.data)}`,
      variacao && `Em ${variacao.dias} dias: ${variacao.variacaoPorcentual > 0 ? '+' : ''}${formatarTaxa(variacao.variacaoPorcentual)}`,
    ]
    conteudo = {
      valor: formatarCotacao(atual.valor),
      referencia: `Cotação de ${formatarData(atual.data)}`,
      tendencia: anterior && compararPreco(atual.valor, anterior.valor),
      nota: notas.filter(Boolean).join(' · '),
    }
  }

  return (
    <CartaoIndicador
      titulo={titulo}
      descricao={descricao}
      status={estado.status}
      conteudo={conteudo}
      erro={estado.erro}
      aoTentarNovamente={estado.tentarNovamente}
    />
  )
}

function CartaoSelic() {
  const estado = useDados(async (signal) => {
    const [atual, historico] = await buscarAtualEHistorico('selic', mesesAtras(24), signal)
    return { atual, mudanca: ultimaMudanca(historico) }
  }, 'cartao-selic')

  let conteudo: ConteudoCartao | undefined
  if (estado.status === 'sucesso') {
    const { atual, mudanca } = estado.dados
    conteudo = {
      valor: formatarTaxa(atual.valor),
      referencia: `Referência de ${formatarData(atual.data)}`,
      tendencia: mudanca && compararTaxa(atual.valor, mudanca.anterior),
      nota: mudanca && `Em vigor desde ${formatarData(mudanca.desde)}`,
    }
  }

  return (
    <CartaoIndicador
      titulo="Selic"
      descricao="Taxa básica de juros, ao ano"
      status={estado.status}
      conteudo={conteudo}
      erro={estado.erro}
      aoTentarNovamente={estado.tentarNovamente}
    />
  )
}

function CartaoIpca() {
  const estado = useDados(
    // O IPCA demora para ser divulgado: 6 meses garantem pelo menos 2 pontos
    (signal) => buscarHistorico('ipca', paraIso(mesesAtras(6)), paraIso(new Date()), signal),
    'cartao-ipca',
  )

  let conteudo: ConteudoCartao | undefined
  const ultimo = estado.dados?.at(-1)
  if (ultimo && estado.dados) {
    const anterior = pontoAnterior(estado.dados, ultimo.data)
    conteudo = {
      valor: formatarTaxa(ultimo.valor),
      referencia: `Referência de ${formatarMesAnoLongo(ultimo.data)}`,
      tendencia: anterior && compararTaxa(ultimo.valor, anterior.valor),
      nota: anterior && `Em relação a ${formatarMesAnoLongo(anterior.data)}`,
    }
  }

  return (
    <CartaoIndicador
      titulo="IPCA"
      descricao="Inflação no último mês divulgado"
      status={estado.status}
      conteudo={conteudo}
      erro={estado.erro}
      aoTentarNovamente={estado.tentarNovamente}
    />
  )
}

/**
 * O IPCA esperado e o juro real vêm do mesmo endpoint. A API não tem histórico
 * desses dois, então não existe valor anterior real: eles aparecem sem seta.
 */
function CartoesJuroReal() {
  const estado = useDados((signal) => buscarJuroReal(signal), 'cartao-juro-real')
  const dados = estado.dados

  const comuns = {
    status: estado.status,
    erro: estado.erro,
    aoTentarNovamente: estado.tentarNovamente,
  }

  return (
    <>
      <CartaoIndicador
        {...comuns}
        titulo="IPCA esperado"
        descricao="Expectativa para 12 meses (Focus)"
        conteudo={
          dados && {
            valor: formatarTaxa(dados.ipca),
            referencia: `Boletim de ${formatarData(dados.dataPrevista)}`,
            nota: 'Mediana das projeções do mercado',
          }
        }
      />
      <CartaoIndicador
        {...comuns}
        titulo="Juro real"
        descricao="Selic descontada a inflação esperada"
        conteudo={
          dados && {
            valor: formatarTaxa(dados.juroReal),
            referencia: `Calculado com o boletim de ${formatarData(dados.dataPrevista)}`,
            nota: `Fisher: Selic de ${formatarTaxa(dados.selic)} e IPCA esperado de ${formatarTaxa(dados.ipca)}`,
          }
        }
      />
    </>
  )
}

export function CartoesIndicadores() {
  return (
    <div className="grade-indicadores">
      <CartaoMoeda indicador="dolar" titulo="Dólar" descricao="Venda, PTAX" />
      <CartaoMoeda indicador="euro" titulo="Euro" descricao="Venda, PTAX" />
      <CartaoSelic />
      <CartaoIpca />
      <CartoesJuroReal />
    </div>
  )
}
