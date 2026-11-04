# Front-end do MacroPulse

Site em **React + Vite + TypeScript** que consome a API Java do projeto. Este documento explica como ele está organizado e por que cada decisão foi tomada.

## Como rodar, buildar e checar o lint

Pré-requisito: **Node 20 ou superior** (`node -v`).

```bash
# 1. Na raiz do repositório: sobe o banco e a API
docker compose up -d db api

# 2. Em outro terminal
cd front
npm install       # só na primeira vez, ou quando o package.json mudar
npm run dev       # site em http://localhost:5173
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento: a página atualiza sozinha ao salvar um arquivo |
| `npm run build` | Confere os tipos (`tsc`) e gera a versão final na pasta `dist/` |
| `npm run preview` | Abre localmente a versão gerada pelo build |
| `npm run lint` | Procura problemas no código com o `oxlint`, o linter que vem no template atual do Vite |

## Estrutura de pastas

```
front/
├── index.html          # página única; aplica o tema antes do React carregar
├── vite.config.ts      # configuração do Vite, incluindo o proxy
├── package.json        # dependências e scripts
├── public/             # arquivos copiados sem alteração (favicon)
└── src/
    ├── main.tsx        # ponto de entrada: liga o React ao HTML e carrega o CSS
    ├── App.tsx         # define as rotas
    ├── api/            # funções que chamam a API
    ├── types/          # tipos que espelham os DTOs do Java
    ├── hooks/          # lógica reutilizável (busca de dados, tema)
    ├── components/     # peças visuais usadas em mais de um lugar
    ├── pages/          # uma pasta de arquivo por rota
    ├── utils/          # funções puras (formatação, datas)
    └── styles/         # CSS próprio, separado por assunto
```

### Para que serve cada pasta

- **`types/`**: `api.ts` traz os tipos dos DTOs. Se a API mudar um campo, o TypeScript aponta os lugares afetados na hora do build, em vez de o erro aparecer só no navegador.
- **`api/`**: as telas nunca chamam `fetch` diretamente. `cliente.ts` centraliza a chamada e o tratamento de erros, enquanto `indicadores.ts` e `simulador.ts` têm uma função por endpoint.
- **`hooks/`**: `useDados` cuida de buscar, cancelar e informar o estado. `useTema` dá acesso ao tema.
- **`components/`**: cabeçalho, rodapé, botões e os estados de carregando, erro e vazio.
- **`pages/`**: `Painel`, `Simulador`, `Sobre` e `Sugestoes`.
- **`utils/`**: `formatacao.ts` converte números e datas para o padrão brasileiro.
- **`styles/`**: `variaveis.css` (cores e medidas), `base.css` (tags), `layout.css` (moldura) e `componentes.css` (peças).

## O que é CORS e por que o proxy evita o problema

**Origem** é a combinação de protocolo, domínio e porta. `http://localhost:5173` e `http://localhost:8081` são origens **diferentes**, só por causa da porta.

**CORS** (*Cross-Origin Resource Sharing*) é uma regra de segurança **do navegador**: por padrão, um JavaScript de uma origem não pode ler a resposta de outra origem, a não ser que o servidor autorize com cabeçalhos como `Access-Control-Allow-Origin`.

Sem proxy, o site em `:5173` chamaria a API em `:8081` e o navegador bloquearia a leitura. Uma solução seria configurar CORS no Spring. Com o proxy, isso não é necessário:

```
SEM PROXY: duas origens, o navegador bloqueia
  Navegador (localhost:5173) ──X──> API (localhost:8081)

COM PROXY: para o navegador, existe uma origem só
  Navegador ──> Vite (localhost:5173) ──> API (localhost:8081)
                     repassa /api/...
```

O proxy é um servidor no meio do caminho. O navegador só conversa com o Vite, e o Vite repassa o pedido para a API. Como CORS é uma regra do navegador, não vale para a conversa entre dois servidores.

Por isso o front sempre usa **caminhos relativos** (`/api/indicadores/selic/atual`), e o mesmo código funciona em qualquer ambiente:

| Ambiente | Quem recebe `/api/...` | Quem repassa para a API |
| --- | --- | --- |
| Desenvolvimento | Vite (`localhost:5173`) | proxy do `vite.config.ts` |
| Docker | Nginx (`localhost:3000`) | proxy do `front/nginx.conf` |

Os caminhos repassados são `/api`, `/swagger-ui`, `/swagger-ui.html` e `/v3/api-docs`.

## Como o front fala com a API

```
Página ──> useDados ──> api/indicadores.ts ──> api/cliente.ts ──> fetch ──> API
```

### Tratamento de erros

Toda falha vira um `ErroApi`, com uma mensagem amigável e, quando existe, o `detail` do `ProblemDetail` da API:

| Situação | Mensagem principal |
| --- | --- |
| Sem conexão (status 0) | Não foi possível conectar à API |
| 400 | Os dados enviados não são válidos |
| 404 | Ainda não há dados disponíveis para esta consulta |
| 503 | O Banco Central está indisponível no momento |
| Outros (como 500 ou 502) | A API não conseguiu responder agora |

A leitura do corpo do erro é protegida porque nem toda falha traz JSON: com a API desligada, o proxy devolve uma resposta sem esse formato.

### O hook `useDados`

Todo lugar que busca dados tem três estados, e `useDados` entrega qual é o atual: `carregando`, `erro` ou `sucesso`. O estado "vazio" é decidido por quem recebe a lista.

Dois cuidados importantes:

- **Cancelamento:** ao trocar de período ou sair da tela, o pedido em andamento é cancelado com `AbortController`. Sem isso, uma resposta atrasada poderia sobrescrever a mais recente.
- **"Carregando" é calculado:** cada resultado guarda a chave do pedido que o gerou. Se a chave atual é outra, o estado é "carregando". Assim, os dados do período anterior nunca aparecem por um instante após a troca.

## Tema claro e escuro

1. **Variáveis CSS:** em `variaveis.css`, cada tema define os mesmos nomes (`--cor-fundo`, `--cor-texto`...) com valores diferentes. O restante do CSS só usa as variáveis.
2. **`data-tema` no `<html>`:** o atributo decide qual bloco de cores vale.
3. **Padrão do sistema:** sem escolha salva, o site segue o `prefers-color-scheme` e acompanha mudanças do sistema.
4. **Escolha salva:** ao clicar no botão, a escolha vai para o `localStorage`, dentro de `try/catch`, porque o acesso pode ser bloqueado pelo navegador.
5. **Sem "piscar":** um script curto no `index.html` aplica o tema antes de a página aparecer, sem esperar o React.

O azul é a cor de destaque para não se confundir com o verde e o vermelho, reservados para alta e queda.

## Responsividade

- O `.container` limita a largura em telas grandes e mantém margens laterais no celular.
- Até `54rem` (cerca de 864 px), a navegação vira um painel aberto pelo **botão hambúrguer**. O painel fecha ao escolher um link ou apertar `Esc`.
- Os títulos usam `clamp()`, que ajusta o tamanho da fonte à largura da tela.

## Formatação em pt-BR

`utils/formatacao.ts` usa o `Intl`, a API de internacionalização do próprio navegador.

| Função | Exemplo | Uso |
| --- | --- | --- |
| `formatarCotacao` | `R$ 5,4935` | dólar e euro (4 casas) |
| `formatarMoeda` | `R$ 1.234,56` | valores do simulador |
| `formatarTaxa` | `13,75%` | Selic, IPCA, juro real |
| `formatarData` | `04/11/2026` | datas |

**A armadilha das datas:** `new Date('2026-11-04')` é interpretado como meia-noite em UTC. No Brasil (UTC-3), isso ainda é dia 03, então a data apareceria errada. Por isso, a conversão e a formatação usam UTC nas duas pontas.

## Bibliotecas e por que foram escolhidas

| Biblioteca | Para quê | Por quê |
| --- | --- | --- |
| `react` | Interface em componentes | Pedido do projeto e muito usada no mercado |
| `vite` | Servidor de desenvolvimento e build | Rápido, com proxy integrado |
| `typescript` | Tipos | Detecta erros antes de rodar, como no Java |
| `react-router-dom` | Páginas sem recarregar o site | Padrão para rotas em React |
| `chart.js` + `react-chartjs-2` | Gráficos | Completa e simples de usar |

O visual usa **CSS próprio**, sem Tailwind nem bibliotecas de componentes, para que todo o estilo seja fácil de entender e alterar.

## Decisões tomadas

- **Caminhos relativos e proxy, sem CORS:** o backend não precisou mudar.
- **`<a>` comum para o Swagger:** ele não é uma página do React, quem responde é a API Java.
- **`<title>` dentro das páginas:** o React 19 leva a tag para o `<head>`, sem biblioteca extra.
- **`createBrowserRouter`:** permite usar o `ScrollRestoration`, que volta ao topo ao trocar de página e restaura a posição ao usar "voltar".

## Problemas encontrados e como foram resolvidos

- **Botão hambúrguer aparecendo no computador:** `.botao-icone` vem depois no CSS e sobrescrevia o `display: none` do hambúrguer. Solução: usar duas classes no seletor (`.botao-icone.cabecalho__hamburguer`), que têm prioridade maior.
- **Porta 5173 ocupada:** outro projeto pode estar usando a porta. O Vite escolhe a próxima livre e mostra o endereço no terminal; o proxy continua funcionando normalmente.
- **`node_modules` dentro do OneDrive:** a pasta tem milhares de arquivos e deixa a sincronização lenta. Ela não vai para o Git, mas o OneDrive tenta sincronizá-la. Se atrapalhar, pause a sincronização enquanto trabalha ou mantenha o projeto fora do OneDrive.
