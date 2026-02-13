# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npx ng build --configuration production

# Stage 2: Build backend with frontend embedded
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app/backend
COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY backend/src/ src/
COPY --from=frontend-build /app/frontend/dist/frontend/browser/ src/main/resources/static/
RUN ./mvnw package -B -DskipTests

# Stage 3: Production image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S tzr && adduser -S tzr -G tzr
COPY --from=backend-build /app/backend/target/*.jar app.jar
RUN chown -R tzr:tzr /app
USER tzr
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
