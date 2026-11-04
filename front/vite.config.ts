import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Endereço da API Java durante o desenvolvimento
const API = 'http://localhost:8081'

export default defineConfig({
  plugins: [react()],
  server: {
    // O front chama sempre caminhos relativos (/api/...). Em desenvolvimento, o
    // próprio servidor do Vite repassa esses pedidos para a API Java. Para o
    // navegador, tudo vem da mesma origem, então não há problema de CORS.
    // Explicação completa em docs/FRONT.md.
    proxy: {
      '/api': API,
      '/swagger-ui': API,
      '/swagger-ui.html': API,
      '/v3/api-docs': API,
    },
  },
})
