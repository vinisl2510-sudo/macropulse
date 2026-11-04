import type { FormEvent } from 'react'
import { PRODUTOS, type IdProduto } from '../pages/produtosSimulador'
import type { CamposSimulador, ErrosSimulador } from '../utils/validacaoSimulador'

const ATALHOS_PRAZO = [
  { texto: '6 meses', dias: 180 },
  { texto: '1 ano', dias: 365 },
  { texto: '2 anos', dias: 730 },
  { texto: '5 anos', dias: 1825 },
]

type PropsCampo = {
  id: keyof CamposSimulador
  rotulo: string
  dica?: string
  prefixo?: string
  sufixo?: string
  valor: string
  erro?: string
  passo: string
  aoMudar: (valor: string) => void
}

function Campo({ id, rotulo, dica, prefixo, sufixo, valor, erro, passo, aoMudar }: PropsCampo) {
  const descricao = [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(' ') || undefined

  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <div className={`campo__entrada ${erro ? 'campo__entrada--erro' : ''}`}>
        {prefixo && <span aria-hidden="true">{prefixo}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step={passo}
          required
          value={valor}
          aria-invalid={Boolean(erro)}
          aria-describedby={descricao}
          onChange={(evento) => aoMudar(evento.target.value)}
        />
        {sufixo && <span aria-hidden="true">{sufixo}</span>}
      </div>
      {dica && (
        <p className="campo__dica" id={`${id}-dica`}>
          {dica}
        </p>
      )}
      {erro && (
        <p className="campo__erro" id={`${id}-erro`}>
          {erro}
        </p>
      )}
    </div>
  )
}

type Props = {
  campos: CamposSimulador
  erros: ErrosSimulador
  selecionados: Record<IdProduto, boolean>
  carregando: boolean
  aoMudarCampo: (campo: keyof CamposSimulador, valor: string) => void
  aoAlternarProduto: (produto: IdProduto) => void
  aoEnviar: () => void
}

export function FormularioSimulador({
  campos,
  erros,
  selecionados,
  carregando,
  aoMudarCampo,
  aoAlternarProduto,
  aoEnviar,
}: Props) {
  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    aoEnviar()
  }

  return (
    // noValidate: desliga os balões do navegador, porque os erros aparecem em português junto de cada campo
    <form className="cartao formulario" onSubmit={enviar} noValidate>
      <Campo
        id="valor"
        rotulo="Valor investido"
        prefixo="R$"
        passo="0.01"
        valor={campos.valor}
        erro={erros.valor}
        aoMudar={(valor) => aoMudarCampo('valor', valor)}
      />

      <div>
        <Campo
          id="prazo"
          rotulo="Prazo em dias"
          sufixo="dias"
          passo="1"
          valor={campos.prazo}
          erro={erros.prazo}
          aoMudar={(valor) => aoMudarCampo('prazo', valor)}
        />
        <div className="atalhos" role="group" aria-label="Atalhos de prazo">
          {ATALHOS_PRAZO.map((atalho) => (
            <button
              key={atalho.dias}
              type="button"
              aria-pressed={Number(campos.prazo) === atalho.dias}
              onClick={() => aoMudarCampo('prazo', String(atalho.dias))}
            >
              {atalho.texto}
            </button>
          ))}
        </div>
      </div>

      <Campo
        id="percentual"
        rotulo="Rentabilidade do CDB"
        sufixo="% do CDI"
        passo="0.01"
        valor={campos.percentual}
        erro={erros.percentual}
        aoMudar={(valor) => aoMudarCampo('percentual', valor)}
      />

      <fieldset className="campo-grupo" aria-describedby={erros.produtos ? 'produtos-erro' : undefined}>
        <legend>Investimentos a comparar</legend>
        {PRODUTOS.map((produto) => (
          <label key={produto.id} className="opcao">
            <input
              type="checkbox"
              checked={selecionados[produto.id]}
              onChange={() => aoAlternarProduto(produto.id)}
            />
            {produto.nome}
          </label>
        ))}
        {erros.produtos && (
          <p className="campo__erro" id="produtos-erro">
            {erros.produtos}
          </p>
        )}
      </fieldset>

      <button type="submit" className="botao botao--primario formulario__enviar" disabled={carregando}>
        {carregando ? 'Simulando...' : 'Simular'}
      </button>
    </form>
  )
}
