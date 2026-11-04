import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/variaveis.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/componentes.css'
import './styles/formulario.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
