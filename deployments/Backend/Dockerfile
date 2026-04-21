FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:resolve -q

COPY src ./src
RUN mvn clean package -DskipTests -q

# Production stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/backend-*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Dspring.config.location=file:./application.properties"

ENTRYPOINT ["java", "-jar", "app.jar"]
