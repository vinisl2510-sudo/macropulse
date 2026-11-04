import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProvedorTema } from './components/ProvedorTema'
import { Painel } from './pages/Painel'
import { Simulador } from './pages/Simulador'
import { Sobre } from './pages/Sobre'
import { Sugestoes } from './pages/Sugestoes'

const rotas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Painel /> },
      { path: '/simulador', element: <Simulador /> },
      { path: '/sobre', element: <Sobre /> },
      { path: '/sugestoes', element: <Sugestoes /> },
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
