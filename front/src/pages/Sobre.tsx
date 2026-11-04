import { BotaoSwagger } from '../components/BotaoSwagger'
import '../styles/paginas.css'

const FONTES = [
  { indicador: 'Selic meta', servico: 'SGS, série 432', frequencia: 'Diária' },
  { indicador: 'IPCA', servico: 'SGS, série 433', frequencia: 'Mensal' },
  { indicador: 'Dólar (venda)', servico: 'PTAX, CotacaoDolarPeriodo', frequencia: 'Dias úteis' },
  { indicador: 'Euro (venda, fechamento)', servico: 'PTAX, CotacaoMoedaPeriodo', frequencia: 'Dias úteis' },
  { indicador: 'IPCA esperado 12 meses', servico: 'Focus, ExpectativasMercadoInflacao12Meses', frequencia: 'Diária' },
]

const STACK = [
  {
    titulo: 'Backend',
    itens: [
      'Java 21 e Spring Boot 4.1.2',
      'Spring Web MVC e RestClient',
      'Spring Data JPA',
      'Spring Cache, @Scheduled e @Retryable',
      'Bean Validation e ProblemDetail',
      'springdoc-openapi (Swagger)',
    ],
  },
  {
    titulo: 'Banco e testes',
    itens: ['PostgreSQL 16', 'Flyway (migrations)', 'JUnit 6, Mockito, AssertJ e MockMvc'],
  },
  {
    titulo: 'Front-end',
    itens: ['React, Vite e TypeScript', 'React Router', 'Chart.js', 'CSS próprio com variáveis'],
  },
  {
    titulo: 'Infraestrutura',
    itens: ['Docker e Docker Compose', 'Nginx (site e proxy reverso)', 'Monorepo com back e front'],
  },
]

const DECISOES = [
  {
    titulo: 'Cache nas consultas',
    texto: 'Os dados mudam só uma vez por dia, então a leitura não precisa ir ao banco toda hora. O cache é invalidado sempre que chegam dados novos.',
  },
  {
    titulo: 'Retry na coleta',
    texto: 'Se o Banco Central falha, a chamada é repetida automaticamente. Um indicador fora do ar não impede a atualização dos outros.',
  },
  {
    titulo: 'Scheduler',
    texto: 'A coleta roda todo dia útil às 18h e ao iniciar a aplicação, buscando só os dias que faltam, sem duplicar registros.',
  },
  {
    titulo: 'ProblemDetail',
    texto: 'Todos os erros seguem o mesmo formato (RFC 9457), o que permite ao front mostrar mensagens claras para 400, 404 e 503.',
  },
  {
    titulo: 'BigDecimal',
    texto: 'Valores financeiros não usam double, que acumula erros de arredondamento. Os cálculos usam BigDecimal com HALF_UP.',
  },
  {
    titulo: 'Testes',
    texto: '17 testes cobrem o simulador, os cálculos e os controllers, inclusive os limites de cada faixa do IR. A suíte não depende da internet.',
  },
  {
    titulo: 'Docker',
    texto: 'Um único comando sobe o banco, a API e o site. O proxy reverso do Nginx evita a necessidade de CORS.',
  },
]

const ROADMAP = [
  { texto: 'Coleta de Selic, dólar, euro, IPCA e IPCA esperado', feito: true },
  { texto: 'Endpoints de cotação atual e histórico', feito: true },
  { texto: 'Atualização agendada, cache e retry', feito: true },
  { texto: 'Juro real e variação do dólar', feito: true },
  { texto: 'Simulador de investimentos', feito: true },
  { texto: 'Testes automatizados, Swagger e Docker', feito: true },
  { texto: 'Front-end', feito: true },
  { texto: 'Envio das sugestões por e-mail', feito: false },
  { texto: 'Deploy', feito: false },
]

function CaixaDiagrama({ titulo, detalhe, destaque }: { titulo: string; detalhe: string; destaque?: boolean }) {
  return (
    <li className={`diagrama__caixa ${destaque ? 'diagrama__caixa--destaque' : ''}`}>
      <strong>{titulo}</strong>
      <span>{detalhe}</span>
    </li>
  )
}

export function Sobre() {
  return (
    <>
      <title>Sobre | MacroPulse</title>

      <header className="topo-pagina">
        <h1>Sobre o MacroPulse</h1>
        <p>
          Projeto de portfólio para vagas de backend no mercado financeiro. Coleta dados oficiais do Banco Central, guarda
          o histórico, calcula indicadores e os entrega por uma API documentada, consumida por este site.
        </p>
      </header>

      <section className="secao-sobre" aria-labelledby="titulo-arquitetura">
        <h2 id="titulo-arquitetura">Arquitetura</h2>
        <p className="secao__intro">O site nunca chama o Banco Central diretamente: tudo passa pela API Java.</p>

        <ol
          className="diagrama"
          aria-label="Fluxo: o navegador acessa o site no Nginx, que repassa os pedidos para a API Spring Boot. A API lê e grava no PostgreSQL e busca os dados no Banco Central."
        >
          <CaixaDiagrama titulo="Navegador" detalhe="React, Vite e TypeScript" />
          <CaixaDiagrama titulo="Nginx" detalhe="Site e proxy de /api" />
          <CaixaDiagrama titulo="API Spring Boot" detalhe="Controllers, serviços, cache e scheduler" destaque />
          <li className="diagrama__ramos">
            <ul>
              <CaixaDiagrama titulo="PostgreSQL" detalhe="Histórico dos indicadores" />
              <CaixaDiagrama titulo="Banco Central" detalhe="SGS, PTAX e Focus" />
            </ul>
          </li>
        </ol>

        <ul className="lista-pontos">
          <li>
            <strong>Escrita e leitura separadas:</strong> o <code>AtualizacaoService</code> busca e grava; o{' '}
            <code>IndicadorQueryService</code> só lê, com cache.
          </li>
          <li>
            <strong>Uma tabela simples:</strong> <code>indicador</code> guarda tipo, data e valor, e a constraint{' '}
            <code>UNIQUE (tipo, data)</code> impede registros duplicados.
          </li>
        </ul>
      </section>

      <section className="secao-sobre" aria-labelledby="titulo-stack">
        <h2 id="titulo-stack">Stack</h2>
        <div className="grade-sobre">
          {STACK.map((grupo) => (
            <div key={grupo.titulo}>
              <h3>{grupo.titulo}</h3>
              <ul className="lista-simples">
                {grupo.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="secao-sobre" aria-labelledby="titulo-fontes">
        <h2 id="titulo-fontes">Fontes de dados do Banco Central</h2>
        <div className="cartao tabela-rolavel" tabIndex={0} role="region" aria-labelledby="titulo-fontes">
          <table>
            <thead>
              <tr>
                <th scope="col">Indicador</th>
                <th scope="col">Série ou serviço</th>
                <th scope="col">Frequência</th>
              </tr>
            </thead>
            <tbody>
              {FONTES.map((fonte) => (
                <tr key={fonte.indicador}>
                  <td>{fonte.indicador}</td>
                  <td>
                    <code>{fonte.servico}</code>
                  </td>
                  <td>{fonte.frequencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="secao-sobre" aria-labelledby="titulo-decisoes">
        <h2 id="titulo-decisoes">Decisões técnicas</h2>
        <div className="grade-sobre">
          {DECISOES.map((decisao) => (
            <div key={decisao.titulo}>
              <h3>{decisao.titulo}</h3>
              <p>{decisao.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="secao-sobre" aria-labelledby="titulo-roadmap">
        <h2 id="titulo-roadmap">Roadmap</h2>
        <ul className="roadmap">
          {ROADMAP.map((item) => (
            <li key={item.texto} className={item.feito ? 'roadmap__item--feito' : undefined}>
              <span className="roadmap__marca">{item.feito ? 'Concluído' : 'Pendente'}</span>
              {item.texto}
            </li>
          ))}
        </ul>
      </section>

      <section className="secao-sobre autor" aria-labelledby="titulo-autor">
        <h2 id="titulo-autor">Autor</h2>
        <p className="autor__nome">Vinicius Soares Loureiro</p>
        <div className="autor__links">
          <a
            className="botao botao--discreto"
            href="https://github.com/vinisl2510-sudo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
            <span className="visualmente-oculto"> (abre em nova aba)</span>
          </a>
          <a
            className="botao botao--discreto"
            href="https://www.linkedin.com/in/vin%C3%ADcius-soares-loureiro-9bb96b34b"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
            <span className="visualmente-oculto"> (abre em nova aba)</span>
          </a>
          <BotaoSwagger />
        </div>
      </section>
    </>
  )
}
