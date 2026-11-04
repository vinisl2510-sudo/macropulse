# ===== Etapa 1: compilar o site =====
FROM node:24-alpine AS build
WORKDIR /app

# copia primeiro só o que define as dependências (aproveita o cache do Docker)
COPY package.json package-lock.json ./
RUN npm ci

# depois copia o código e gera a pasta dist
COPY . .
RUN npm run build

# ===== Etapa 2: imagem final, só para servir os arquivos =====
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
