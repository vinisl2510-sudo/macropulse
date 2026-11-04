import type { FormEvent } from 'react'
import '../styles/paginas.css'

export function Sugestoes() {
  // O envio ainda não existe: nada sai do navegador
  const enviar = (evento: FormEvent) => evento.preventDefault()

  return (
    <>
      <title>Sugestões | MacroPulse</title>

      <header className="topo-pagina">
        <h1>Sugestões</h1>
        <p>Tem uma ideia de indicador, encontrou um problema ou quer comentar o projeto? Este espaço é para isso.</p>
      </header>

      <div className="sugestoes">
        <p className="aviso" role="note">
          Envio por e-mail em breve: esta funcionalidade será implementada numa próxima versão.
        </p>

        <form className="cartao formulario" onSubmit={enviar}>
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <div className="campo__entrada">
              <input id="nome" type="text" autoComplete="name" />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <div className="campo__entrada">
              <input id="email" type="email" autoComplete="email" />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="mensagem">Mensagem</label>
            <div className="campo__entrada">
              <textarea id="mensagem" rows={6} />
            </div>
          </div>

          <button type="submit" className="botao botao--primario formulario__enviar" disabled>
            Enviar (em breve)
          </button>
        </form>
      </div>
    </>
  )
}
