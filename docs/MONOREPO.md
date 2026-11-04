# Monorepo no MacroPulse

Este documento explica o que é um monorepo, por que o MacroPulse migrou para esse formato e o passo a passo exato da migração.

## O que é um monorepo

**Monorepo** é um único repositório Git que guarda mais de um projeto. No MacroPulse, são dois: a API Java e o site em React.

A alternativa seria ter dois repositórios separados (o chamado *polyrepo*).

| | Monorepo | Dois repositórios |
| --- | --- | --- |
| Mudança que afeta front e back | Um único PR | Dois PRs, que precisam ser coordenados |
| Subir tudo com um comando | Simples: o `docker-compose.yml` enxerga as duas pastas | Exige clonar os dois repositórios |
| Versão do projeto | Uma tag vale para o conjunto | Cada lado tem as suas tags |
| Quem avalia o portfólio | Vê tudo em um só lugar | Precisa abrir dois links |
| Ponto fraco | O histórico mistura os dois projetos | Mais trabalho para manter tudo alinhado |

## Por que migramos

Até a Fase 10, o Git ficava dentro de `back/macropulse`. A pasta `front/` estava fora do repositório, então o front não teria histórico nem PRs. Além disso, o `docker-compose.yml` não conseguiria construir o site de forma natural, porque o front estava fora da pasta dele.

Como é um projeto pequeno, feito por uma pessoa, e front e back são entregues juntos, o monorepo é a opção mais simples.

## Antes e depois

```
ANTES                                   DEPOIS
macropulse/          (sem Git)          macropulse/          (.git AQUI)
├── back/                               ├── .git/
│   └── macropulse/                     ├── .gitignore       (novo)
│       ├── .git/    (Git aqui)         ├── docker-compose.yml
│       ├── docker-compose.yml          ├── README.md
│       ├── README.md                   ├── docs/
│       └── src/, pom.xml...            ├── front/
└── front/           (fora do Git)      └── back/
                                            └── macropulse/
                                                └── src/, pom.xml...
```

## Como o histórico e as tags foram preservados

A pasta `.git` **é** o repositório: guarda todos os commits, branches e tags. Os arquivos que você vê no projeto são apenas uma cópia de trabalho.

Por isso, a migração não reescreveu nada:

1. A pasta `.git` foi movida dois níveis acima, com os commits e as tags dentro dela.
2. O Git passou a olhar a pasta `macropulse/` e percebeu que os arquivos agora estão em outro caminho.
3. Como o conteúdo de cada arquivo é idêntico, ele reconhece a mudança como **renomeação**, e não como arquivo apagado e criado.

Os commits antigos continuam com os mesmos identificadores (hashes). Foi feito só um commit novo, em cima deles, registrando as renomeações. Nada de `--force` nem de `rebase`.

**Conferência feita na migração:**

- O HEAD era `4c1b54a` antes e depois de mover o `.git`.
- As 11 tags continuaram no lugar (`v0.0.1` até `v0.10.0`).
- O `git status` mostrou 47 arquivos como `renamed`, com 0 linhas alteradas e nenhum apagado.

## Passo a passo do que foi feito

```bash
# 1. Com o IntelliJ fechado e o git status limpo, cria a branch
cd back/macropulse
git checkout -b chore/monorepo

# 2. Move o repositório dois níveis acima
cd ../..
mv back/macropulse/.git .git

# 3. Registra a mudança e confere se aparece "renamed"
git add -A
git status
git commit -m "chore: move o backend para back/macropulse"

# 4. Cria o .gitignore da raiz (node_modules, dist, .vite, IDE, SO)
git add .gitignore
git commit -m "chore: adiciona .gitignore na raiz do monorepo"

# 5. Sobe o compose para a raiz e aponta o build para a nova pasta
git mv back/macropulse/docker-compose.yml docker-compose.yml
#    no serviço api:  build: ./back/macropulse

# 6. Sobe o README para a raiz, ajusta os comandos e cria esta documentação
git mv back/macropulse/README.md README.md

# 7. Valida antes de enviar qualquer coisa ao GitHub
docker compose up --build -d
curl http://localhost:8081/api/indicadores/selic/atual
docker compose up -d db
cd back/macropulse && ./mvnw test
```

## Como ver o histórico de um arquivo

O `git log` comum, com um caminho, para na renomeação. Use `--follow` para continuar antes dela:

```bash
git log --follow -- back/macropulse/pom.xml
```

O `docker-compose.yml` e o `README.md` voltaram ao caminho que tinham no Git antes da migração, a raiz do repositório.

## Por que os dados do banco não se perderam

O nome de um volume do Docker Compose é formado por **`<nome do projeto>_<nome do volume>`**, e o nome do projeto vem, por padrão, do nome da pasta onde está o `docker-compose.yml`.

- Antes: pasta `back/macropulse`, projeto `macropulse`, volume `macropulse_pgdata`.
- Depois: pasta `macropulse`, projeto `macropulse`, volume `macropulse_pgdata`.

Como as duas pastas têm o mesmo nome, o volume é o mesmo.

> **Atenção:** se você clonar o repositório em uma pasta com outro nome, o Docker cria um volume novo e vazio. Não há perda de dados: a API busca tudo de novo no Banco Central ao subir.

## O que mudou nos caminhos

| Item | Antes | Agora |
| --- | --- | --- |
| Pasta do Git | `back/macropulse/` | raiz `macropulse/` |
| `docker-compose.yml` | `back/macropulse/` | raiz |
| `README.md` | `back/macropulse/` | raiz |
| Código, `pom.xml`, `mvnw`, `Dockerfile`, `simulador.http` | `back/macropulse/` | não mudou |
| `.gitignore` e `.gitattributes` do back | `back/macropulse/` | não mudou (continuam valendo para a subpasta) |
| `.gitignore` geral | não existia | raiz |

## O que muda no dia a dia

| Tarefa | Onde rodar | Comando |
| --- | --- | --- |
| Comandos Git | qualquer pasta do projeto | `git status`, `git checkout`... |
| Subir os containers | raiz | `docker compose up --build` |
| Testes do back | `back/macropulse` | `./mvnw test` |
| Rodar a API local | `back/macropulse` | `./mvnw spring-boot:run` |
| Rodar o site local | `front` | `npm run dev` |

**Java na máquina:** os testes precisam do **Java 21**. Se o `java -version` mostrar outra versão, aponte o `JAVA_HOME` para o JDK 21 antes de rodar o Maven, por exemplo no Git Bash:

```bash
export JAVA_HOME="$HOME/.jdks/ms-21.0.13.0.2"
./mvnw test
```

**Cuidado com caminhos no Git:** eles agora começam em `back/macropulse/`. Exemplo: `git add back/macropulse/pom.xml`. Se você estiver dentro de `back/macropulse`, o caminho relativo (`git add pom.xml`) também funciona.

### IntelliJ

Continue abrindo a pasta **`back/macropulse`** como projeto, porque é lá que está o `pom.xml`.

Como o IntelliJ estava configurado para procurar o Git dentro dessa pasta, ao reabrir ele pode mostrar um aviso de *"Unregistered VCS root"* ou parecer sem Git. Para resolver:

1. Clique em **Add root** no aviso, **ou**
2. Abra **Settings → Version Control → Directory Mappings** e deixe a pasta `macropulse` (a raiz) como raiz do Git, removendo a linha antiga, se ela aparecer com erro.

### Se o Git pedir para apagar uma pasta

Se aparecer `Deletion of directory ... failed. Should I try again? (y/n)` ao trocar de branch, responder `n` é seguro: normalmente é o OneDrive ou o IntelliJ segurando a pasta.

## Problemas encontrados

Nenhum problema de Git ocorreu na migração. Um aviso apareceu e é normal:

- **`warning: LF will be replaced by CRLF`**: o Git no Windows avisa que converte finais de linha ao gravar os arquivos. Não altera o conteúdo versionado. O `mvnw` continua com LF por causa do `.gitattributes` do back, o que é importante para ele rodar dentro do container Linux.
