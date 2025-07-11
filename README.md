# REST API Java - Sans Framework

## Prérequis

- Java JDK version 17 ou supérieure

## Installation en local

1. Clonez ce dépôt :

    ```bash
    git clone https://github.com/heriniavotra/examen-java-api.git
    cd examen-java-api
    ```

2. Créez un dossier `bin` pour les fichiers compilés :
    ```bash
    mkdir bin
    ```

3. Compilez le projet avec la commande :
    ```bash
    javac -d bin src/*.java
    ```

## Exécution

Après compilation, exécutez la classe principale avec :

```bash
java -cp bin Main
```

## Utilisation avec Docker

1. Construisez l'image Docker :
    ```bash
    docker build -t examen-java-api .
    ```

2. Lancez le conteneur :
    ```bash
    docker run -d -p 8081:8081 examen-java-api
    ```

## Utilisation avec Docker Compose

1. Assurez-vous d'avoir un fichier `docker-compose.yml` à la racine du projet.

2. Démarrez les services :
    ```bash
    docker-compose up -d --build 
    ```

L'API sera accessible sur [http://localhost:8080]

## Liens 

1. Frontend: [https://web-app-java.up.railway.app](https://web-app-java.up.railway.app)

2. Backend : [https://server-api-java.up.railway.app](https://server-api-java.up.railway.app)

