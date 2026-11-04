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
- **`pages/`**: `Painel`, `Simulador`, `Sobre`, `Sugestoes` e `NaoEncontrada` (404).
- **`utils/`**: `formatacao.ts` (padrão brasileiro), `datas.ts` (intervalos de período), `tendencia.ts` (setas de alta e queda) e `validacaoSimulador.ts`.
- **`styles/`**: `variaveis.css` (cores e medidas), `base.css` (tags), `layout.css` (moldura), `componentes.css` (peças), `formulario.css` (campos) e um arquivo por página: `painel.css`, `simulador.css` e `paginas.css`.

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
- **"Carregando" é calculado:** cada resultado guarda a chave do pedido que o gerou. Se a chave atual é outra, o estado é "carregando". Os dados antigos só ficam disponíveis em `dadosAnteriores`, e os gráficos os mostram esmaecidos durante a espera, para a tela não pular nem piscar.

## Como cada página funciona

### Painel (`/`)

**Cards de indicadores** (`CartoesIndicadores.tsx`): cada card busca os próprios dados, então a falha de um não derruba os outros.

| Card | Endpoints | Com o que a seta compara |
| --- | --- | --- |
| Dólar | `/dolar/atual`, `/dolar/historico`, `/dolar/variacao?dias=30` | Dia útil anterior (variação em %) |
| Euro | `/euro/atual`, `/euro/historico` | Dia útil anterior (variação em %) |
| Selic | `/selic/atual`, `/selic/historico` | Último valor **diferente** (diferença em p.p.) |
| IPCA | `/ipca/historico` | Mês anterior (diferença em p.p.) |
| IPCA esperado | `/juro-real` | Sem seta |
| Juro real | `/juro-real` | Sem seta |

- **Por que a Selic compara com o último valor diferente:** ela é publicada todo dia e fica igual por semanas. Comparar com a véspera diria sempre "sem variação". O card mostra, por exemplo, "Queda de 0,25 p.p., em vigor desde 17/09/2026".
- **Por que o IPCA não tem endpoint "atual":** o valor é o último item do histórico.
- **Por que dois cards não têm seta:** a API não oferece histórico do IPCA esperado nem do juro real, então não existe um valor anterior verdadeiro. Inventar uma comparação seria pior do que não mostrar. Para ter a seta, seria preciso um novo endpoint no backend.
- **Taxas em p.p., preços em %:** se a Selic vai de 14% para 13,75%, a queda é de 0,25 ponto percentual. Dizer "1,79%" confundiria.
- **Alta e queda não dependem só da cor:** há seta e texto, com contraste verificado nos dois temas.

**Gráficos** (`PainelGraficos.tsx` e `GraficoHistorico.tsx`): um único seletor 1M / 6M / 1A / 2A vale para os quatro gráficos, para os números sempre se referirem ao mesmo período.

| Gráfico | Forma | Por quê |
| --- | --- | --- |
| Selic | Linha em escada | A taxa fica igual e muda de uma vez, sem transição |
| Dólar e euro | Linha | Variação contínua, dia a dia |
| IPCA | Barras | Cada mês é um valor separado, e pode ser negativo |

- **IPCA em 1M:** o último dado costuma ter mais de um mês, então o intervalo viria vazio. Nesse período, o gráfico mostra os 3 últimos meses divulgados, com uma nota explicando.
- **Data "de hoje" local:** `paraIso` usa o dia local, porque `toISOString()` usa UTC e, às 22h no Brasil, já seria o dia seguinte.
- **Sem área pintada nas linhas:** o eixo não começa em zero, e a área sugeriria um tamanho que não existe. Nas barras o eixo começa em zero, como deve ser.
- **Tabela em cada gráfico:** o canvas é só uma imagem para leitores de tela. Por isso há uma descrição (`aria-label`) e a opção "Ver dados em tabela", cujas linhas só são criadas ao abrir.

**Seção "O que a API faz"** (`SecaoApi.tsx`): lista funcionalidades e endpoints, com o botão para o Swagger.

### Simulador (`/simulador`)

Consome só o `POST /api/simulador`, e só quando a pessoa clica em **Simular**.

```
Formulário ──> validação no front ──> API ──> 3 resultados ──> filtro dos checkboxes ──> cards e gráfico
```

- **Filtro só no front:** a API sempre devolve CDB, Tesouro Selic e Poupança. Marcar ou desmarcar um checkbox não faz nova chamada. Como o nome do CDB muda ("CDB 110% do CDI"), cada resultado é identificado pela **posição** na lista, que é sempre a mesma.
- **Validação em duas camadas:** o front avisa na hora, junto de cada campo; a API continua validando, porque nunca se deve confiar só no navegador. Se ela devolver 400, o `detail` aparece na tela com os nomes dos campos traduzidos (`prazoDias` vira "Prazo").
- **Limites só no front:** a API aceita qualquer número positivo, e valores absurdos geram resultados com dezenas de dígitos. O front limita a R$ 1 bilhão, 50 anos e 500% do CDI. Também exige prazo inteiro, porque a API truncaria 1,5 para 1 sem avisar.
- **Melhor valor líquido:** recebe borda e um selo escrito, calculados só entre os investimentos marcados. Com um único marcado, não há selo, pois não há comparação.
- **Gráfico de barras deitadas:** os nomes ficam legíveis no celular. O eixo começa em zero, então as barras parecem próximas quando os valores são próximos, e essa é a leitura honesta. Os valores exatos estão nos cards.
- **Legenda em HTML:** com duas séries (líquido e bruto), a cor nunca fica sem nome.

### Sobre (`/sobre`)

Página estática, sem chamadas à API: objetivo, diagrama de arquitetura, stack, fontes de dados, decisões técnicas, roadmap e autor.

O diagrama é uma **lista ordenada em HTML**, e as setas são desenhadas com CSS. Isso facilita a edição, acompanha o tema automaticamente e é lido na ordem certa por leitores de tela. No celular, ele passa a descer na vertical.

O link do LinkedIn usa a forma codificada do acento (`vin%C3%ADcius`), que funciona em qualquer navegador. Foi conferido abrindo o perfil no navegador, porque o LinkedIn bloqueia testes automáticos com o código 999.

### Sugestões (`/sugestoes`)

Formulário com nome, e-mail e mensagem, com o **envio desativado** e o aviso de que a funcionalidade virá em uma próxima versão. Não há backend para isso ainda, e nada sai do navegador.

### Página 404

A rota `*` captura qualquer endereço que não exista e mostra uma página com link de volta ao Painel, mantendo cabeçalho e rodapé.

### Cores dos gráficos nos dois temas

O canvas do Chart.js não entende variáveis CSS. O hook `useCoresGrafico` lê os valores do CSS e é refeito quando o tema muda, redesenhando os gráficos. Por isso, `ProvedorTema` muda o atributo `data-tema` **antes** de atualizar o estado do React: quando o gráfico renderiza, as cores novas já estão valendo.

As cores das séries foram validadas com um script que simula daltonismo e mede o contraste. Cada tema tem tons próprios, pois o tom que funciona no fundo branco não é o mesmo que funciona no escuro.

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
- **Páginas com `lazy`:** cada página vira um arquivo separado, baixado só quando alguém a abre. O Chart.js, por exemplo, só é baixado pelas páginas com gráfico.

## Problemas encontrados e como foram resolvidos

- **Botão hambúrguer aparecendo no computador:** `.botao-icone` vem depois no CSS e sobrescrevia o `display: none` do hambúrguer. Solução: usar duas classes no seletor (`.botao-icone.cabecalho__hamburguer`), que têm prioridade maior.
- **"A API respondeu em um formato inesperado" em todos os cards:** o servidor do Vite estava ligado durante uma troca de branch. A pasta `front/` sumiu por um instante, e o processo continuou rodando sem a configuração do proxy, devolvendo o HTML do site no lugar do JSON. Salvar o `vite.config.ts` de novo não resolveu, porque o processo também parou de perceber as mudanças. **Solução: parar com `Ctrl+C` e rodar `npm run dev` de novo.** Para evitar, pare o servidor antes de trocar para uma branch sem a pasta `front/`.
- **Área pintada enganosa nos gráficos de linha:** com o eixo começando em R$ 4,50, a área sugeria uma grandeza que não existe. Solução: deixar só a linha.
- **Gráfico que não encolhia com a janela:** a coluna do CSS Grid não fica menor que o conteúdo por padrão. Solução: usar `minmax(0, 1fr)` nas colunas.
- **Aviso de arquivo maior que 500 kB no build:** o Chart.js estava no arquivo principal. Solução: carregar as páginas com `lazy`, separando o código.
- **Porta 5173 ocupada:** outro projeto pode estar usando a porta. O Vite escolhe a próxima livre e mostra o endereço no terminal; o proxy continua funcionando normalmente.
- **`node_modules` dentro do OneDrive:** a pasta tem milhares de arquivos e deixa a sincronização lenta. Ela não vai para o Git, mas o OneDrive tenta sincronizá-la. Se atrapalhar, pause a sincronização enquanto trabalha ou mantenha o projeto fora do OneDrive.
