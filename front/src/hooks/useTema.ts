import { createContext, useContext } from 'react'

export type Tema = 'claro' | 'escuro'

export type ContextoTema = {
  tema: Tema
  alternarTema: () => void
}

export const TemaContexto = createContext<ContextoTema | null>(null)

/** Dá acesso ao tema atual em qualquer componente. */
export function useTema(): ContextoTema {
  const contexto = useContext(TemaContexto)
  if (!contexto) {
    throw new Error('useTema precisa estar dentro de <ProvedorTema>')
  }
  return contexto
}
