FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY src ./src
RUN javac -d out src/*.java

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/out ./out
ENV PORT=8080 DADOS=/data/estado.xml
EXPOSE 8080
CMD ["java", "-cp", "out", "Servidor"]
