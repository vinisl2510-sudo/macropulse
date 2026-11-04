import { BotaoSwagger } from './BotaoSwagger'

const FUNCIONALIDADES = [
  {
    titulo: 'Coleta automática diária',
    texto: 'Busca os dados no Banco Central todo dia útil às 18h e ao iniciar, só para os dias que faltam.',
  },
  {
    titulo: 'Cotações atuais e históricas',
    texto: 'Selic, dólar, euro e IPCA, guardados no PostgreSQL e consultados por período.',
  },
  {
    titulo: 'Juro real por Fisher',
    texto: 'Desconta da Selic a inflação esperada pelo boletim Focus, sem a aproximação da subtração simples.',
  },
  {
    titulo: 'Variação do dólar',
    texto: 'Calcula a variação percentual da cotação nos últimos N dias.',
  },
  {
    titulo: 'Simulador com IR regressivo',
    texto: 'Compara o rendimento líquido de CDB, Tesouro Selic e poupança, com cálculos em BigDecimal.',
  },
  {
    titulo: 'Retry e cache',
    texto: 'Tenta de novo quando o Banco Central falha e guarda as consultas até chegarem dados novos.',
  },
  {
    titulo: 'Erros em ProblemDetail',
    texto: 'Respostas de erro padronizadas pela RFC 9457, com status 400, 404 e 503.',
  },
]

const ENDPOINTS = [
  { metodo: 'GET', rota: '/api/indicadores/selic/atual', descricao: 'Selic meta mais recente' },
  { metodo: 'GET', rota: '/api/indicadores/dolar/atual', descricao: 'Cotação de venda do dólar mais recente' },
  { metodo: 'GET', rota: '/api/indicadores/euro/atual', descricao: 'Cotação de venda do euro mais recente' },
  { metodo: 'GET', rota: '/api/indicadores/selic/historico?inicio=&fim=', descricao: 'Selic no período' },
  { metodo: 'GET', rota: '/api/indicadores/dolar/historico?inicio=&fim=', descricao: 'Dólar no período' },
  { metodo: 'GET', rota: '/api/indicadores/euro/historico?inicio=&fim=', descricao: 'Euro no período' },
  { metodo: 'GET', rota: '/api/indicadores/ipca/historico?inicio=&fim=', descricao: 'IPCA mensal no período' },
  { metodo: 'GET', rota: '/api/indicadores/dolar/variacao?dias=30', descricao: 'Variação do dólar nos últimos N dias' },
  { metodo: 'GET', rota: '/api/indicadores/juro-real', descricao: 'Juro real pela fórmula de Fisher' },
  { metodo: 'POST', rota: '/api/simulador', descricao: 'Simulação de investimentos' },
]

export function SecaoApi() {
  return (
    <section className="secao" aria-labelledby="titulo-api">
      <div className="secao__topo">
        <div>
          <h2 id="titulo-api">O que a API faz</h2>
          <p className="secao__intro">Tudo nesta página vem de uma API REST em Java com Spring Boot.</p>
        </div>
        <BotaoSwagger />
      </div>

      <ul className="grade-funcionalidades">
        {FUNCIONALIDADES.map((item) => (
          <li key={item.titulo}>
            <h3>{item.titulo}</h3>
            <p>{item.texto}</p>
          </li>
        ))}
      </ul>

      <h3 className="secao__subtitulo">Endpoints</h3>
      <div className="cartao tabela-endpoints" tabIndex={0} role="region" aria-label="Lista de endpoints da API">
        <table>
          <thead>
            <tr>
              <th scope="col">Método</th>
              <th scope="col">Rota</th>
              <th scope="col">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map((endpoint) => (
              <tr key={endpoint.rota}>
                <td>
                  <span className={`metodo metodo--${endpoint.metodo.toLowerCase()}`}>{endpoint.metodo}</span>
                </td>
                <td>
                  <code>{endpoint.rota}</code>
                </td>
                <td>{endpoint.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
