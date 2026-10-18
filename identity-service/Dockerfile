# Stage 1: build
# Start with a Maven image that includes JDK 25
FROM maven:3.9.16-eclipse-temurin-25-alpine AS build

# Copy source code and pom.xml file to /app folder
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build source code with maven
RUN mvn package -DskipTests

#Stage 2: create image
# Start with Eclipse Temurin JRE 25
FROM eclipse-temurin:25.0.4_7-jre-alpine

# Set working folder to App and copy complied file from above step
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
