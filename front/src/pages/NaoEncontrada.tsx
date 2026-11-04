import { Link } from 'react-router-dom'
import '../styles/paginas.css'

export function NaoEncontrada() {
  return (
    <div className="nao-encontrada">
      <title>Página não encontrada | MacroPulse</title>
      <p className="nao-encontrada__codigo">404</p>
      <h1>Página não encontrada</h1>
      <p>O endereço pode estar errado ou a página pode ter mudado de lugar.</p>
      <Link className="botao botao--primario" to="/">
        Voltar ao Painel
      </Link>
    </div>
  )
}
