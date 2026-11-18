# ===== Etapa 1: compilar o projeto =====
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# copia primeiro só o que define as dependências (aproveita o cache do Docker)
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# depois copia o código e gera o .jar
COPY src src
RUN ./mvnw package -DskipTests -B

# ===== Etapa 2: imagem final, só para rodar =====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# A porta pode ser trocada pela variável PORT (a Vercel usa ela)
ENV PORT=8081
ENV TZ=America/Sao_Paulo
# Usa até 75% da memória do container e liga mais rápido (importante na Vercel,
# que desliga o container sem acesso e liga de novo no próximo pedido)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1 -XX:+UseSerialGC"
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]