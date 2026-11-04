import { useState } from 'react'
import type { CotacaoDTO } from '../types/api'

type Props = {
  pontos: CotacaoDTO[]
  formatarValor: (valor: number) => string
  formatarData: (data: string) => string
}

/**
 * Os mesmos dados do gráfico em forma de tabela, para quem usa leitor de tela ou
 * quer o número exato. As linhas só são criadas ao abrir, pois podem ser centenas.
 */
export function TabelaDados({ pontos, formatarValor, formatarData }: Props) {
  const [aberta, setAberta] = useState(false)

  return (
    <details className="tabela-dados" onToggle={(evento) => setAberta(evento.currentTarget.open)}>
      <summary>Ver dados em tabela</summary>
      {aberta && (
        <div className="tabela-dados__rolagem" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              {/* Mais recente primeiro */}
              {[...pontos].reverse().map((ponto) => (
                <tr key={ponto.data}>
                  <td>{formatarData(ponto.data)}</td>
                  <td>{formatarValor(ponto.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  )
}
