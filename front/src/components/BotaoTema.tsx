import { useTema } from '../hooks/useTema'

export function BotaoTema() {
  const { tema, alternarTema } = useTema()
  const proximo = tema === 'escuro' ? 'claro' : 'escuro'

  return (
    <button
      type="button"
      className="botao-icone"
      onClick={alternarTema}
      aria-label={`Mudar para o tema ${proximo}`}
      title={`Mudar para o tema ${proximo}`}
    >
      {tema === 'escuro' ? (
        // Sol: clicar leva ao tema claro
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Lua: clicar leva ao tema escuro
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  )
}
