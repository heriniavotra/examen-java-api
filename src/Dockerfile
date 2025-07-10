FROM openjdk:21-ea-21-slim-buster

WORKDIR /app

COPY . .

RUN mkdir -p bin && javac -d bin src/*.java

CMD ["java", "-cp", "bin", "Main"]

EXPOSE 8081
