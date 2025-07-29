# Tests Automatiques API REST

Ce fichier contient les instructions pour exécuter les tests automatiques de votre API REST Java.

## Fichiers de test

- **`src/ApiTest.java`** : Classe Java principale contenant tous les tests automatiques
- **`test-api.sh`** : Script bash pour automatiser l'exécution des tests

## Utilisation

### Option 1 : Script automatique (recommandé)
```bash
./test-api.sh
```

Ce script va :
1. Compiler automatiquement les sources
2. Vérifier si le serveur est en cours d'exécution
3. Proposer de démarrer le serveur si nécessaire
4. Lancer les tests automatiques
5. Afficher un rapport détaillé

### Option 2 : Exécution manuelle

1. **Compiler les sources** (si pas déjà fait) :
   ```bash
   javac -d bin src/*.java
   ```

2. **Démarrer le serveur** (dans un terminal séparé) :
   ```bash
   java -cp bin Main
   ```

3. **Lancer les tests** (dans un autre terminal) :
   ```bash
   java -cp bin ApiTest
   ```

## Tests inclus

Le fichier `ApiTest.java` teste les fonctionnalités suivantes :

### ✅ Tests de base
- **Reset de la file** : `POST /tickets/reset`
- **Ajout de tickets** : `POST /tickets/enqueue`
- **Consultation du prochain ticket** : `GET /tickets/peek`
- **Taille de la file** : `GET /tickets/size`
- **File vide** : `GET /tickets/isEmpty`
- **Retrait de tickets** : `DELETE /tickets/dequeue`

### 🏢 Tests des guichets
- **Prochain ticket pour guichet** : `POST /tickets/guichet/{id}/next`
- **Ticket actuel du guichet** : `GET /tickets/guichet/{id}`
- **Liste de tous les guichets** : `GET /tickets/guichets`

### ❌ Tests d'erreur
- **Route inexistante** : Test du code 404
- **Méthode non autorisée** : Test du code 405
- **Valeur invalide** : Test du code 400

## Exemple de sortie

```
🚀 Démarrage des tests automatiques de l'API REST
==================================================
✅ Serveur accessible sur http://localhost:8081

🧹 Test: Reset de la file
  ✅ Reset queue - RÉUSSI

➕ Test: Ajout de tickets
  ✅ Enqueue ticket 101 - RÉUSSI
  ✅ Enqueue ticket 102 - RÉUSSI
  ✅ Enqueue ticket 103 - RÉUSSI

📊 Résultats: 15/15 tests réussis (100.0%)
🎉 Tous les tests sont passés avec succès!
```

## Personnalisation

Vous pouvez facilement modifier `ApiTest.java` pour :
- Ajouter de nouveaux tests
- Modifier les valeurs de test
- Changer l'URL du serveur (variable `BASE_URL`)
- Ajuster les timeouts

## Dépannage

- **Serveur non accessible** : Assurez-vous que le serveur est démarré sur le port 8081
- **Erreur de compilation** : Vérifiez que Java JDK 11+ est installé
- **Tests échoués** : Vérifiez les logs du serveur pour identifier les erreurs
