# REST API Java - Gestionnaire de File FIFO de Tickets

Une API REST simple implémentée en Java pur (sans framework) pour gérer une file FIFO de tickets avec des opérations d'enqueue, dequeue, peek, et gestion de guichets.

## Description du Projet

Cette API implémente un système de gestion de tickets basé sur une structure de données FIFO (First In, First Out). Elle permet de :
- Ajouter des tickets à la file (enqueue)
- Retirer des tickets de la file (dequeue)  
- Consulter le prochain ticket sans le retirer (peek)
- Vérifier la taille et l'état de la file
- Gérer des guichets pour assigner des tickets

## Fonctionnalités

### Endpoints disponibles :
- `POST /tickets/enqueue` - Ajouter un ticket à la file
- `GET /tickets/peek` - Consulter le prochain ticket sans le retirer
- `DELETE /tickets/dequeue` - Retirer le prochain ticket de la file
- `GET /tickets/size` - Obtenir la taille de la file
- `GET /tickets/isEmpty` - Vérifier si la file est vide
- `POST /tickets/guichets/{id}/assign` - Assigner un ticket à un guichet
- `DELETE /tickets/guichets/{id}/release` - Libérer un guichet
- `GET /tickets/guichets` - Lister tous les guichets et leurs états

### Documentation API
L'API est documentée avec Swagger UI, accessible à la racine du serveur une fois démarré.

## Prérequis

- Java JDK version 17 ou supérieure
- Docker (optionnel pour la containerisation)
- Docker Compose (optionnel)

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

Le serveur démarrera sur le port 8081. Vous verrez le message :
```
✅ Serveur HTTP démarré sur le port 8081
```

### Accès à l'API
- **Interface Swagger UI** : [http://localhost:8081](http://localhost:8081)
- **Documentation OpenAPI** : [http://localhost:8081/swagger.yaml](http://localhost:8081/swagger.yaml)
- **Endpoints API** : `http://localhost:8081/tickets/*`

## Exemples d'utilisation

### Ajouter un ticket
```bash
curl -X POST http://localhost:8081/tickets/enqueue \
  -H "Content-Type: text/plain" \
  -d "42"
```

### Consulter le prochain ticket
```bash
curl http://localhost:8081/tickets/peek
```

### Retirer un ticket
```bash
curl -X DELETE http://localhost:8081/tickets/dequeue
```

### Vérifier la taille de la file
```bash
curl http://localhost:8081/tickets/size
```

### Gérer les guichets
```bash
# Assigner un ticket au guichet 1
curl -X POST http://localhost:8081/tickets/guichets/1/assign

# Libérer le guichet 1
curl -X DELETE http://localhost:8081/tickets/guichets/1/release

# Voir tous les guichets
curl http://localhost:8081/tickets/guichets
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

L'API sera accessible sur [http://localhost:8081](http://localhost:8081)

## Architecture du Projet

```
examen-java-api/
├── src/
│   ├── Main.java          # Point d'entrée, serveur HTTP
│   ├── TaskHandler.java   # Gestionnaire des requêtes HTTP
│   ├── TaskService.java   # Logique métier
│   ├── Task.java          # Modèle de données pour les tickets
│   └── Fifo.java          # Implémentation de la structure FIFO
├── bin/                   # Fichiers compilés (.class)
├── public/                # Interface web frontend (optionnel)
├── swagger.yaml           # Documentation OpenAPI
├── Dockerfile             # Configuration Docker
├── docker-compose.yml     # Configuration Docker Compose
└── README.md             # Ce fichier
```

## Technologies Utilisées

- **Java 17+** : Langage de programmation principal
- **HttpServer** : Serveur HTTP intégré de Java (com.sun.net.httpserver)
- **Swagger/OpenAPI 3.0** : Documentation de l'API
- **Docker** : Containerisation
- **CORS** : Support des requêtes cross-origin

## Dépannage

### Erreurs courantes

1. **Port 8081 déjà utilisé**
   ```bash
   # Trouver le processus utilisant le port
   lsof -i :8081
   # Arrêter le processus si nécessaire
   kill -9 <PID>
   ```

2. **Problème de compilation Java**
   - Vérifiez votre version Java : `java -version`
   - Assurez-vous que le dossier `bin` existe
   - Vérifiez les permissions des fichiers

3. **Fichier swagger.yaml non trouvé**
   - Assurez-vous que le fichier `swagger.yaml` est à la racine du projet
   - Vérifiez les permissions de lecture

### Tests manuels
Vous pouvez tester l'API avec :
- **Interface Swagger UI** dans votre navigateur
- **curl** en ligne de commande (voir exemples ci-dessus)
- **Postman** ou tout autre client REST

## Liens 

1. **Frontend** : [https://examen-java-api.onrender.com/](https://examen-java-api.onrender.com/)
2. **Backend déployé** : [https://server-api-java.up.railway.app](https://server-api-java.up.railway.app)

## Contribution

Pour contribuer au projet :
1. Forkez le repository
2. Créez une branche pour votre feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créez une Pull Request

## Licence

Ce projet est développé dans le cadre d'un examen académique.

## Contact

Pour toute question ou suggestion, contactez [heriniavotra](https://github.com/heriniavotra).

