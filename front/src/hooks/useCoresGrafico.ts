import { useMemo } from 'react'
import { useTema } from './useTema'

/**
 * O canvas do Chart.js não entende variáveis CSS, então lemos os valores delas
 * aqui. Como `tema` é dependência do useMemo, a troca de tema relê as cores e os
 * gráficos são redesenhados. Assim as cores ficam em um lugar só: variaveis.css.
 */
export function useCoresGrafico() {
  const { tema } = useTema()

  return useMemo(() => {
    const css = getComputedStyle(document.documentElement)
    const ler = (nome: string) => css.getPropertyValue(nome).trim()

    return {
      tema,
      serie1: ler('--grafico-serie-1'),
      serie1Forte: ler('--grafico-serie-1-forte'),
      serie2: ler('--grafico-serie-2'),
      serie2Forte: ler('--grafico-serie-2-forte'),
      grade: ler('--grafico-grade'),
      texto: ler('--cor-texto'),
      textoSuave: ler('--cor-texto-suave'),
      superficie: ler('--cor-superficie'),
      borda: ler('--cor-borda'),
    }
  }, [tema])
}

export type CoresGrafico = ReturnType<typeof useCoresGrafico>
