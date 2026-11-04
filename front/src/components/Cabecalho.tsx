import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BotaoTema } from './BotaoTema'
import { BotaoSwagger } from './BotaoSwagger'

const LINKS = [
  { para: '/', texto: 'Painel' },
  { para: '/simulador', texto: 'Simulador' },
  { para: '/sobre', texto: 'Sobre' },
  { para: '/sugestoes', texto: 'Sugestões' },
]

export function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false)
  const fecharMenu = () => setMenuAberto(false)

  // Esc fecha o menu do celular
  useEffect(() => {
    if (!menuAberto) return
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [menuAberto])

  return (
    <header className="cabecalho">
      <div className="cabecalho__barra container">
        <Link to="/" className="logo" onClick={fecharMenu}>
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M3 17h7l3-9 5 16 3-7h8" />
          </svg>
          MacroPulse
        </Link>

        <div className={`cabecalho__menu ${menuAberto ? 'cabecalho__menu--aberto' : ''}`} id="menu-principal">
          <nav aria-label="Principal" className="navegacao">
            {LINKS.map((link) => (
              <NavLink key={link.para} to={link.para} end={link.para === '/'} onClick={fecharMenu}>
                {link.texto}
              </NavLink>
            ))}
          </nav>
          <BotaoSwagger variante="discreto" />
        </div>

        <div className="cabecalho__acoes">
          <BotaoTema />
          <button
            type="button"
            className="botao-icone cabecalho__hamburguer"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {menuAberto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
