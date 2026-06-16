FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q && \
    wget -q https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.6.0/opentelemetry-javaagent.jar \
         -O /app/opentelemetry-javaagent.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
COPY --from=build /app/opentelemetry-javaagent.jar opentelemetry-javaagent.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
