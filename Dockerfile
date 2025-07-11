FROM openjdk:21-ea-21-slim-buster

WORKDIR /app

COPY src /app/src

COPY swagger.yaml /app/swagger.yaml

RUN mkdir /app/bin && javac -d /app/bin /app/src/*.java

CMD ["java", "-cp", "bin", "Main"]

EXPOSE 8081
