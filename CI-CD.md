# CI/CD Pipeline Documentation

## 🔧 Pipeline de Tests Automatiques

Ce pipeline GitHub Actions exécute automatiquement une suite complète de tests pour l'API REST Java.

### 🚀 Déclenchement

Le pipeline se déclenche automatiquement sur :
- **Push** vers les branches `master` ou `main`
- **Pull Request** vers la branche `master`

### 📋 Étapes du Pipeline

#### 1. **📥 Checkout Code**
- Récupération du code source depuis le repository

#### 2. **☕ Set up JDK 21**
- Installation de Java JDK 21 (Temurin distribution)

#### 3. **🧪 Compile Java**
- Création du dossier `bin/`
- Compilation de tous les fichiers `.java` du dossier `src/`

#### 4. **🚀 Run Automated API Tests**
- Démarrage automatique du serveur API en arrière-plan
- Attente du démarrage complet (jusqu'à 30 tentatives)
- Exécution de la suite de tests `ApiTest.java`
- Arrêt propre du serveur
- Vérification des codes de sortie

#### 5. **📊 Generate Test Report**
- Génération d'un rapport de test détaillé en Markdown
- Capture des résultats de test dans un fichier texte
- Inclusion des métadonnées (date, commit, branche)

#### 6. **📎 Upload Test Results**
- Upload des artefacts de test pour consultation
- Disponibles même si les tests échouent (`if: always()`)

#### 7. **🧪 Run server in background (test)**
- Test supplémentaire de connectivité basique
- Vérification que le serveur répond sur le port 8081

#### 8. **🐳 Build Docker Image API**
- Construction de l'image Docker pour déploiement

### 📊 Tests Exécutés

La suite de tests automatiques inclut **15 tests** couvrant :

- ✅ **Opérations FIFO** : enqueue, dequeue, peek
- ✅ **Gestion d'état** : size, isEmpty, reset
- ✅ **Gestion des guichets** : assignation, consultation, listage
- ✅ **Gestion d'erreurs** : routes inexistantes, méthodes non autorisées, valeurs invalides
- ✅ **Cas limites** : file vide, dépassement de capacité

### 🎯 Critères de Réussite

Le pipeline **PASSE** si :
- ✅ Compilation sans erreurs
- ✅ Serveur démarre correctement
- ✅ Tous les 15 tests automatiques réussissent (100%)
- ✅ Construction Docker réussie

Le pipeline **ÉCHOUE** si :
- ❌ Erreur de compilation
- ❌ Serveur ne démarre pas dans les 60 secondes
- ❌ Un ou plusieurs tests échouent
- ❌ Erreur de construction Docker

### 📁 Artefacts Générés

Après chaque exécution, les artefacts suivants sont disponibles :

- **`test-report.md`** : Rapport détaillé au format Markdown
- **`test-results.txt`** : Sortie brute des tests

### 🔧 Configuration Locale

Pour reproduire le pipeline localement :

```bash
# 1. Compiler
mkdir -p bin
javac -d bin src/*.java

# 2. Lancer les tests
./test-api.sh

# 3. Ou manuellement
java -cp bin Main &
java -cp bin ApiTest
```

### 🐛 Dépannage

#### Tests qui échouent
1. Vérifiez les logs du pipeline dans l'onglet Actions
2. Consultez les artefacts `test-results.txt`
3. Reproduisez localement avec `./test-api.sh`

#### Serveur ne démarre pas
1. Vérifiez si le port 8081 est libre
2. Augmentez le timeout dans le pipeline si nécessaire
3. Vérifiez les erreurs de compilation

#### Erreurs Docker
1. Vérifiez la syntaxe du `Dockerfile`
2. Assurez-vous que tous les fichiers nécessaires sont présents

### 📈 Métriques

Le pipeline affiche :
- **Temps d'exécution** total
- **Pourcentage de réussite** des tests
- **Détails** des tests échoués
- **Code de sortie** pour intégration CI/CD

### 🔄 Améliorations Futures

Améliorations possibles du pipeline :
- [ ] Tests de performance
- [ ] Analyse de code statique
- [ ] Tests de sécurité
- [ ] Déploiement automatique
- [ ] Notifications Slack/Email
