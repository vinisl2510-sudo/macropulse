import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TemaContexto, type Tema } from '../hooks/useTema'

const CHAVE = 'macropulse-tema'

// Com try/catch porque o localStorage pode estar bloqueado (aba anônima, por exemplo)
function lerEscolhaSalva(): Tema | null {
  try {
    const salvo = localStorage.getItem(CHAVE)
    return salvo === 'claro' || salvo === 'escuro' ? salvo : null
  } catch {
    return null
  }
}

function salvarEscolha(tema: Tema) {
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // Sem armazenamento, o tema funciona normalmente até recarregar a página
  }
}

function temaDoSistema(): Tema {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

/**
 * O CSS troca as cores pelo atributo data-tema da tag <html>. O atributo muda
 * ANTES do estado do React: os gráficos leem as cores do CSS ao renderizar e
 * precisam já encontrar os valores do tema novo.
 */
function aplicarNoHtml(tema: Tema) {
  document.documentElement.dataset.tema = tema
}

export function ProvedorTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => {
    const inicial = lerEscolhaSalva() ?? temaDoSistema()
    aplicarNoHtml(inicial)
    return inicial
  })

  // Enquanto a pessoa não escolher um tema, acompanha as mudanças do sistema
  useEffect(() => {
    const preferencia = matchMedia('(prefers-color-scheme: dark)')
    const aoMudar = () => {
      if (lerEscolhaSalva() !== null) return
      const novo = temaDoSistema()
      aplicarNoHtml(novo)
      setTema(novo)
    }
    preferencia.addEventListener('change', aoMudar)
    return () => preferencia.removeEventListener('change', aoMudar)
  }, [])

  const valor = useMemo(
    () => ({
      tema,
      alternarTema: () => {
        const novo: Tema = tema === 'escuro' ? 'claro' : 'escuro'
        salvarEscolha(novo)
        aplicarNoHtml(novo)
        setTema(novo)
      },
    }),
    [tema],
  )

  return <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>
}
