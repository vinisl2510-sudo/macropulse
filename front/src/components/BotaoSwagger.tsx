type Props = {
  variante?: 'primario' | 'discreto'
}

/**
 * Abre o Swagger da API em uma nova aba. É um <a> comum, e não um Link do React
 * Router, porque o Swagger não é uma página do React: quem responde é a API Java.
 */
export function BotaoSwagger({ variante = 'primario' }: Props) {
  return (
    <a className={`botao botao--${variante}`} href="/swagger-ui.html" target="_blank" rel="noopener noreferrer">
      Documentação da API
      <span className="visualmente-oculto"> (abre em nova aba)</span>
      <svg className="botao__icone" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 5h5v5M19 5l-9 9M18 14v5H5V6h5" />
      </svg>
    </a>
  )
}
