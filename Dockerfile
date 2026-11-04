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
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]