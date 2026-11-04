import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Cabecalho } from './Cabecalho'
import { Rodape } from './Rodape'

/** Moldura comum de todas as páginas. A página atual aparece no lugar do <Outlet />. */
export function Layout() {
  return (
    <>
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" className="container conteudo">
        <Outlet />
      </main>
      <Rodape />
      {/* Ao trocar de página, volta ao topo; ao usar "voltar", restaura a posição */}
      <ScrollRestoration />
    </>
  )
}
