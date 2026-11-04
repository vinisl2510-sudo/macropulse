import { useEffect, useRef, useState } from 'react'
import { ErroApi } from '../api/cliente'
import { simular } from '../api/simulador'
import { Carregando, EstadoVazio, MensagemErro } from '../components/Estados'
import { FormularioSimulador } from '../components/FormularioSimulador'
import { RegrasSimulador } from '../components/RegrasSimulador'
import { ResultadosSimulador } from '../components/ResultadosSimulador'
import '../styles/simulador.css'
import type { SimulacaoResponseDTO } from '../types/api'
import {
  paraRequisicao,
  temErros,
  validarSimulador,
  type CamposSimulador,
  type ErrosSimulador,
} from '../utils/validacaoSimulador'
import { PRODUTOS, type IdProduto } from './produtosSimulador'

type EstadoSimulacao =
  | { status: 'inicial' }
  | { status: 'carregando' }
  | { status: 'erro'; erro: ErroApi }
  | { status: 'sucesso'; simulacao: SimulacaoResponseDTO }

export function Simulador() {
  const [campos, setCampos] = useState<CamposSimulador>({ valor: '10000', prazo: '365', percentual: '100' })
  const [erros, setErros] = useState<ErrosSimulador>({})
  const [selecionados, setSelecionados] = useState<Record<IdProduto, boolean>>({
    cdb: true,
    tesouro: true,
    poupanca: true,
  })
  const [estado, setEstado] = useState<EstadoSimulacao>({ status: 'inicial' })

  // Guarda o pedido em andamento para cancelá-lo ao simular de novo ou sair da página
  const pedidoAtual = useRef<AbortController | null>(null)
  useEffect(() => () => pedidoAtual.current?.abort(), [])

  const mudarCampo = (campo: keyof CamposSimulador, valor: string) => {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }))
    setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  const alternarProduto = (produto: IdProduto) => {
    setSelecionados((atuais) => ({ ...atuais, [produto]: !atuais[produto] }))
    setErros((atuais) => ({ ...atuais, produtos: undefined }))
  }

  const enviar = async () => {
    const novosErros = validarSimulador(campos, Object.values(selecionados).some(Boolean))
    setErros(novosErros)
    if (temErros(novosErros)) return

    pedidoAtual.current?.abort()
    const controle = new AbortController()
    pedidoAtual.current = controle
    setEstado({ status: 'carregando' })

    try {
      const simulacao = await simular(paraRequisicao(campos), controle.signal)
      setEstado({ status: 'sucesso', simulacao })
    } catch (erro) {
      if (controle.signal.aborted) return
      setEstado({
        status: 'erro',
        erro: erro instanceof ErroApi ? erro : new ErroApi(0, 'Algo inesperado aconteceu ao simular.'),
      })
    }
  }

  return (
    <>
      <title>Simulador | MacroPulse</title>

      <header className="topo-pagina">
        <h1>Simulador de investimentos</h1>
        <p>Compare quanto sobra no CDB, no Tesouro Selic e na poupança depois do imposto de renda, com a Selic atual.</p>
      </header>

      <div className="simulador">
        <FormularioSimulador
          campos={campos}
          erros={erros}
          selecionados={selecionados}
          carregando={estado.status === 'carregando'}
          aoMudarCampo={mudarCampo}
          aoAlternarProduto={alternarProduto}
          aoEnviar={enviar}
        />

        <div aria-live="polite">
          {estado.status === 'inicial' && (
            <div className="cartao">
              <EstadoVazio texto="Preencha os dados e clique em Simular para ver a comparação." />
            </div>
          )}
          {estado.status === 'carregando' && (
            <div className="cartao">
              <Carregando texto="Calculando..." />
            </div>
          )}
          {estado.status === 'erro' && <MensagemErro erro={estado.erro} aoTentarNovamente={enviar} />}
          {estado.status === 'sucesso' && (
            <ResultadoFiltrado simulacao={estado.simulacao} selecionados={selecionados} />
          )}
        </div>
      </div>

      <RegrasSimulador />
    </>
  )
}

/** A API sempre devolve os 3 investimentos: o filtro dos checkboxes é feito só aqui. */
function ResultadoFiltrado({
  simulacao,
  selecionados,
}: {
  simulacao: SimulacaoResponseDTO
  selecionados: Record<IdProduto, boolean>
}) {
  const resultados = PRODUTOS.filter((produto) => selecionados[produto.id]).map(
    (produto) => simulacao.resultados[produto.indice],
  )

  if (resultados.length === 0) {
    return (
      <div className="cartao">
        <EstadoVazio texto="Marque pelo menos um investimento para ver o resultado." />
      </div>
    )
  }

  return <ResultadosSimulador simulacao={simulacao} resultados={resultados} />
}
