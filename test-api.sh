#!/bin/bash

echo "🔧 Script de test automatique pour l'API REST Java"
echo "================================================="

# Variables d'environnement pour CI/CD
CI_MODE=${CI:-false}
TIMEOUT=${TEST_TIMEOUT:-30}

# Couleurs pour l'affichage (désactivées en mode CI)
if [ "$CI_MODE" = "true" ]; then
    GREEN=''
    RED=''
    YELLOW=''
    NC=''
else
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    YELLOW='\033[1;33m'
    NC='\033[0m' # No Color
fi

# Vérifier si Java est installé
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java n'est pas installé ou n'est pas dans le PATH${NC}"
    exit 1
fi

# Vérifier si javac est installé
if ! command -v javac &> /dev/null; then
    echo -e "${RED}❌ javac n'est pas installé ou n'est pas dans le PATH${NC}"
    exit 1
fi

# Créer le dossier bin s'il n'existe pas
if [ ! -d "bin" ]; then
    echo "📁 Création du dossier bin/"
    mkdir bin
fi

# Compiler les sources
echo "🔨 Compilation des sources..."
javac -d bin src/*.java

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur de compilation${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Compilation réussie${NC}"

# Vérifier si le serveur est en cours d'exécution
echo "🔍 Vérification du serveur..."
if curl -s --max-time 5 http://localhost:8081/tickets/isEmpty > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Serveur détecté sur le port 8081${NC}"
    
    # Exécuter les tests
    echo "🚀 Lancement des tests automatiques..."
    java -cp bin ApiTest
else
    echo -e "${YELLOW}⚠️  Le serveur n'est pas en cours d'exécution${NC}"
    echo "💡 Voulez-vous démarrer le serveur et lancer les tests ? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🚀 Démarrage du serveur en arrière-plan..."
        java -cp bin Main &
        SERVER_PID=$!
        
        # Attendre que le serveur démarre
        echo "⏳ Attente du démarrage du serveur..."
        for i in $(seq 1 $TIMEOUT); do
            if curl -s --max-time 2 http://localhost:8081/tickets/isEmpty > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Serveur démarré avec succès${NC}"
                break
            fi
            sleep 2
            echo "   Tentative $i/$TIMEOUT..."
        done
        
        # Vérifier si le serveur est maintenant accessible
        if curl -s --max-time 5 http://localhost:8081/tickets/isEmpty > /dev/null 2>&1; then
            echo "🧪 Lancement des tests automatiques..."
            java -cp bin ApiTest
        else
            echo -e "${RED}❌ Impossible de démarrer le serveur${NC}"
        fi
        
        # Arrêter le serveur
        echo "🛑 Arrêt du serveur..."
        kill $SERVER_PID 2>/dev/null
    else
        echo "💡 Pour démarrer le serveur manuellement :"
        echo "   java -cp bin Main"
        echo "💡 Puis lancez les tests avec :"
        echo "   java -cp bin ApiTest"
    fi
fi

echo "📋 Tests terminés !"
