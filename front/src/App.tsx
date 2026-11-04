import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProvedorTema } from './components/ProvedorTema'

// Cada página vira um arquivo separado, baixado só quando alguém a abre.
// Assim, quem entra em /sobre não precisa baixar a biblioteca de gráficos.
const Painel = lazy(() => import('./pages/Painel').then((modulo) => ({ default: modulo.Painel })))
const Simulador = lazy(() => import('./pages/Simulador').then((modulo) => ({ default: modulo.Simulador })))
const Sobre = lazy(() => import('./pages/Sobre').then((modulo) => ({ default: modulo.Sobre })))
const Sugestoes = lazy(() => import('./pages/Sugestoes').then((modulo) => ({ default: modulo.Sugestoes })))
const NaoEncontrada = lazy(() => import('./pages/NaoEncontrada').then((modulo) => ({ default: modulo.NaoEncontrada })))

const rotas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Painel /> },
      { path: '/simulador', element: <Simulador /> },
      { path: '/sobre', element: <Sobre /> },
      { path: '/sugestoes', element: <Sugestoes /> },
      // Qualquer outro endereço cai aqui
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
])

export default function App() {
  return (
    <ProvedorTema>
      <RouterProvider router={rotas} />
    </ProvedorTema>
  )
}
