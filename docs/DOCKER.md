# Docker no MacroPulse

Este documento explica tudo que mudou no Docker na Fase 11: o compose na raiz, o novo serviço `web`, o `Dockerfile` do front e o `nginx.conf`, linha a linha.

## O que mudou nesta fase

| Antes | Agora |
| --- | --- |
| `docker-compose.yml` em `back/macropulse/` | `docker-compose.yml` na raiz do repositório |
| Serviço `api` com `build: .` | Serviço `api` com `build: ./back/macropulse` |
| Dois containers: `db` e `api` | Três containers: `db`, `api` e `web` |
| Só a API e o Swagger | Site em `http://localhost:3000` |

O volume `pgdata` e os nomes dos containers `macropulse-db` e `macropulse-api` não mudaram, então os dados do banco foram reaproveitados. O motivo está em [MONOREPO.md](MONOREPO.md).

## Como os 3 containers se comunicam

```
              SEU COMPUTADOR
  Navegador
     │  http://localhost:3000             http://localhost:8081
     │                                    (API direto, opcional)
─────┼────────────────────────────────────────────┼─────────────────
     │         REDE INTERNA DO DOCKER             │
     ▼                                            ▼
┌─────────────────┐   /api, /swagger-ui,   ┌─────────────────┐
│ macropulse-web  │   /v3/api-docs         │ macropulse-api  │
│ Nginx, porta 80 │ ─────────────────────> │ Spring, 8081    │
└─────────────────┘     http://api:8081    └────────┬────────┘
                                                    │ db:5432
                                                    ▼
                                           ┌─────────────────┐     volume
                                           │ macropulse-db   │ <── pgdata
                                           │ PostgreSQL 5432 │
                                           └─────────────────┘
```

A API também acessa a internet para buscar os dados do Banco Central.

**Como um container encontra o outro:** o Docker Compose cria uma rede interna em que o **nome do serviço funciona como endereço**. Por isso o Nginx usa `http://api:8081` e a API usa `db:5432`. Esses nomes só existem dentro da rede; no seu navegador, `http://api:8081` não abre.

## As portas

| Porta no Windows | Porta no container | Serviço | Para quê |
| --- | --- | --- | --- |
| **3000** | 80 | `web` | O site |
| **8081** | 8081 | `api` | A API e o Swagger, acessados diretamente |
| **5433** | 5432 | `db` | Banco de dados, para ferramentas e testes locais |

Em `"3000:80"`, o número da esquerda é a porta no seu computador e o da direita, dentro do container. O banco usa 5433 do lado de fora para não conflitar com um PostgreSQL instalado na 5432.

## O serviço `web` no compose

```yaml
web:
  build: ./front               # constrói a imagem usando front/Dockerfile
  container_name: macropulse-web
  ports:
    - "3000:80"                # localhost:3000 chega na porta 80 do Nginx
  depends_on:
    - api                      # só inicia depois que o container da API iniciar
```

**Atenção ao `depends_on`:** ele espera o container da API **iniciar**, não a aplicação ficar pronta. Nos primeiros segundos, o site pode mostrar a mensagem de erro; basta clicar em "Tentar novamente".

## `front/Dockerfile`, linha a linha

Este é um **build multi-stage**, com várias etapas. A primeira tem tudo para compilar e a segunda leva apenas o resultado.

```dockerfile
FROM node:24-alpine AS build
```
Começa a primeira etapa a partir de uma imagem com Node (versão LTS). `alpine` é uma versão mínima do Linux, e `AS build` dá um nome à etapa, para usá-lo depois.

```dockerfile
WORKDIR /app
```
Define a pasta de trabalho dentro da imagem. Os comandos seguintes rodam nela.

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
```
Copia só os arquivos de dependências e as instala. Essa ordem aproveita o **cache do Docker**: se você mudar só o código, esse passo é reaproveitado e o build fica muito mais rápido. `npm ci` instala exatamente as versões do `package-lock.json`, o que garante um resultado reproduzível.

```dockerfile
COPY . .
RUN npm run build
```
Copia o restante do código e gera a pasta `dist`, com o site pronto. O `.dockerignore` impede que `node_modules` e `dist` locais entrem nessa cópia.

```dockerfile
FROM nginx:alpine
```
Começa a segunda etapa, do zero, com uma imagem que só tem o Nginx. **Nada da primeira etapa vem junto automaticamente.**

```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```
Coloca a nossa configuração no lugar da padrão do Nginx.

```dockerfile
COPY --from=build /app/dist /usr/share/nginx/html
```
Pega da etapa `build` só a pasta `dist` e a coloca onde o Nginx procura os arquivos.

```dockerfile
EXPOSE 80
```
Documenta que o container usa a porta 80. Quem publica a porta de fato é o `ports` do compose.

**Por que vale a pena:** a imagem final tem cerca de **94 MB**, sem Node, sem `node_modules` e sem o código-fonte. É menor, mais rápida de iniciar e tem menos programas que poderiam ter falhas de segurança.

## `front/nginx.conf`, linha a linha

O **Nginx** é um servidor web. Aqui ele faz dois trabalhos: entrega os arquivos do site e repassa os pedidos da API.

```nginx
server {
    listen 80;
```
Atende na porta 80 do container.

```nginx
    root /usr/share/nginx/html;
    index index.html;
```
Indica onde estão os arquivos do site e qual é o arquivo principal de uma pasta.

```nginx
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
```
Compacta as respostas de texto antes de enviar, para o site carregar mais rápido.

```nginx
    resolver 127.0.0.11 valid=30s;
```
`127.0.0.11` é o DNS interno do Docker, que traduz `api` para o endereço do container. `valid=30s` faz o Nginx perguntar de novo a cada 30 segundos. Sem isso, ele guardaria o endereço só ao iniciar e daria erro se o container da API fosse recriado com outro IP.

### Proxy reverso

```nginx
    location ~ ^/(api|swagger-ui|v3/api-docs) {
```
Regra para os caminhos da API. O `~` indica uma expressão regular, que aqui cobre `/api`, `/swagger-ui`, `/swagger-ui.html` e `/v3/api-docs`.

```nginx
        set $api http://api:8081;
        proxy_pass $api;
```
Repassa o pedido para a API, mantendo o caminho original. O endereço fica em uma variável porque só assim o Nginx consulta o `resolver` durante a execução, em vez de exigir que a API exista ao iniciar.

```nginx
        proxy_connect_timeout 5s;
```
Tempo máximo para **conectar** à API. O padrão é de 60 segundos: com a API fora do ar, o site ficaria preso em "Carregando...". Consultas lentas não são afetadas, porque o limite vale só para abrir a conexão.

```nginx
        proxy_set_header Host $http_host;
```
Repassa o endereço que o navegador usou, com a porta (`localhost:3000`). A API o usa para montar o endereço do servidor no Swagger, e é por isso que o "Try it out" funciona pela porta 3000.

```nginx
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
```
Informa à API quem fez o pedido e por qual protocolo. Sem isso, ela veria sempre o Nginx como cliente.

### SPA fallback

```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }
```
Regra para todo o resto. O Nginx tenta, nesta ordem: o arquivo exato, uma pasta com esse nome e, por fim, o `index.html`.

**Por que isso é necessário:** o site é uma **SPA** (*Single Page Application*): só existe um HTML, e quem troca as páginas é o React Router, no navegador. Se você recarregar em `/simulador`, o pedido chega ao Nginx, que não tem nenhum arquivo com esse nome. Sem o fallback, a resposta seria um 404. Com ele, o Nginx entrega o `index.html`, o React inicia, lê o endereço e mostra o Simulador.

**Consequência:** um endereço inexistente também recebe `index.html` com status 200, e é o React que mostra a página 404. Para o usuário, o resultado é o esperado.

## CORS no Docker

Assim como no desenvolvimento, não há CORS: o navegador só conversa com `localhost:3000`, e o Nginx repassa os pedidos da API. Para o navegador, existe uma origem só. A explicação completa está em [FRONT.md](FRONT.md).

## Comandos do dia a dia

Rode tudo na **raiz do repositório**.

| Comando | O que faz |
| --- | --- |
| `docker compose up --build` | Constrói as imagens e sobe tudo, mostrando os logs |
| `docker compose up --build -d` | O mesmo, em segundo plano |
| `docker compose up -d db api` | Sobe só o banco e a API, para desenvolver o front |
| `docker compose up --build -d web` | Reconstrói só o site, depois de mudar o front |
| `docker compose ps` | Mostra os containers do projeto |
| `docker compose logs -f api` | Acompanha os logs da API (`Ctrl+C` para sair) |
| `docker compose stop` | Para os containers, sem removê-los |
| `docker compose down` | Remove os containers e a rede, **mantendo os dados** |

> **Nunca use `docker compose down -v`:** o `-v` apaga o volume, e com ele o banco. A API buscaria os dados de novo no Banco Central, mas seria um trabalho desnecessário.

## Problemas encontrados

- **Site preso em "Carregando..." com a API parada:** com o container parado, o Nginx esperava pelo limite padrão de conexão. Solução: `proxy_connect_timeout 5s`, que faz o erro amigável aparecer em poucos segundos.
- **Risco de endereço antigo da API:** por padrão, o Nginx descobre o endereço só ao iniciar. Solução: `resolver` e `proxy_pass` com variável. O teste foi recriar a API com outro IP (de `172.18.0.3` para `172.18.0.5`), e o site voltou em segundos, sem reiniciar o container `web`.
- **Swagger pela porta 3000:** para o "Try it out" funcionar, a API precisa saber o endereço real. Solução: repassar o cabeçalho `Host` com a porta, usando `$http_host`.
- **Versão no Swagger:** a tela mostra `0.10.0` porque a versão está fixa em `OpenApiConfig.java`. O backend não foi alterado nesta fase, então isso ficou como pendência.
