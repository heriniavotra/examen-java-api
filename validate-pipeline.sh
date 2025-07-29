#!/bin/bash

echo "🧪 Validation du Pipeline CI/CD localement"
echo "=========================================="

# Options de ligne de commande
FORCE_CLEAN=false
if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    FORCE_CLEAN=true
    echo "🧹 Mode nettoyage forcé activé"
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --clean, -c    Forcer le nettoyage des processus Java avant les tests"
    echo "  --help, -h     Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0              # Tests normaux (utilise le serveur existant)"
    echo "  $0 --clean     # Nettoie d'abord, puis teste"
    echo ""
    exit 0
fi

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
STEPS_TOTAL=0
STEPS_PASSED=0

# Fonction pour tester une étape
test_step() {
    local step_name="$1"
    local step_command="$2"
    
    STEPS_TOTAL=$((STEPS_TOTAL + 1))
    echo ""
    echo "🔍 Test: $step_name"
    echo "   Commande: $step_command"
    
    if eval "$step_command" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ RÉUSSI${NC}"
        STEPS_PASSED=$((STEPS_PASSED + 1))
    else
        echo -e "   ${RED}❌ ÉCHOUÉ${NC}"
    fi
}

# Nettoyage initial
echo "🧹 Nettoyage initial..."

if [ "$FORCE_CLEAN" = true ]; then
    echo "🧹 Nettoyage forcé de tous les processus Java..."
    pkill -f "java.*Main" 2>/dev/null || true
    sleep 2
    echo "✅ Nettoyage forcé terminé"
else
    # Vérifier si un serveur tourne déjà
    if curl -s --max-time 2 http://localhost:8081/tickets/isEmpty > /dev/null 2>&1; then
        echo -e "${BLUE}ℹ️  Un serveur est déjà en cours d'exécution sur le port 8081${NC}"
        echo "💡 Le script utilisera le serveur existant pour les tests"
        echo "💡 Utilisez --clean pour forcer le nettoyage"
    else
        echo "✅ Port 8081 libre, prêt pour les tests"
        # Nettoyer les processus Java orphelins s'il y en a
        pkill -f "java.*Main" 2>/dev/null || true
    fi
fi

# Tests des étapes du pipeline
echo ""
echo "📋 Validation des étapes du pipeline:"

# 1. Compilation
test_step "Compilation Java" "mkdir -p bin && javac -d bin src/*.java"

# 2. Vérification des fichiers compilés
test_step "Fichiers compilés présents" "ls bin/*.class"

# 3. Test de démarrage du serveur
echo ""
echo "🔍 Test: Démarrage du serveur"

# Vérifier si le serveur est déjà en cours d'exécution
if curl -s --max-time 2 http://localhost:8081/tickets/isEmpty > /dev/null 2>&1; then
    echo "   ℹ️  Serveur déjà en cours d'exécution sur le port 8081"
    echo -e "   ${GREEN}✅ RÉUSSI${NC}"
    STEPS_PASSED=$((STEPS_PASSED + 1))
    SERVER_WAS_RUNNING=true
else
    echo "   🚀 Démarrage d'un nouveau serveur..."
    java -cp bin Main &
    SERVER_PID=$!
    SERVER_WAS_RUNNING=false
    
    # Attendre que le serveur démarre
    sleep 3
    
    if curl -s --max-time 5 http://localhost:8081/tickets/isEmpty > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ RÉUSSI${NC}"
        STEPS_PASSED=$((STEPS_PASSED + 1))
    else
        echo -e "   ${RED}❌ ÉCHOUÉ${NC}"
    fi
fi
STEPS_TOTAL=$((STEPS_TOTAL + 1))

# 4. Tests automatiques
echo ""
echo "🔍 Test: Exécution des tests automatiques"
if java -cp bin ApiTest > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ RÉUSSI${NC}"
    STEPS_PASSED=$((STEPS_PASSED + 1))
else
    echo -e "   ${RED}❌ ÉCHOUÉ${NC}"
fi
STEPS_TOTAL=$((STEPS_TOTAL + 1))

# Nettoyage du serveur seulement si on l'a démarré nous-mêmes
if [ "$SERVER_WAS_RUNNING" = false ] && [ -n "$SERVER_PID" ]; then
    echo "🛑 Arrêt du serveur démarré par le script..."
    kill $SERVER_PID 2>/dev/null || true
else
    echo "ℹ️  Serveur externe laissé en cours d'exécution"
fi

# 5. Construction Docker
test_step "Construction Docker" "docker build -t rest-api-java-test . --quiet"

# 6. Test du script de test
test_step "Script test-api.sh exécutable" "chmod +x test-api.sh && test -x test-api.sh"

# Résumé
echo ""
echo "=========================================="
echo "📊 Résultats de la validation:"
echo "   $STEPS_PASSED/$STEPS_TOTAL étapes validées"

if [ $STEPS_PASSED -eq $STEPS_TOTAL ]; then
    echo -e "${GREEN}🎉 Tous les tests de validation sont passés!${NC}"
    echo "   Le pipeline devrait fonctionner correctement sur GitHub Actions."
    echo ""
    echo -e "${BLUE}💡 Conseils pour le déploiement:${NC}"
    echo "   • Committez vos changements: git add . && git commit -m 'Update tests'"
    echo "   • Poussez vers GitHub: git push origin master"
    echo "   • Surveillez les Actions GitHub pour le pipeline"
    exit 0
else
    echo -e "${RED}⚠️  Certaines étapes ont échoué.${NC}"
    echo "   Vérifiez les erreurs avant de pousser vers GitHub."
    echo ""
    echo -e "${YELLOW}🔧 Conseils de dépannage:${NC}"
    echo "   • Vérifiez que Java JDK est installé: java -version"
    echo "   • Vérifiez que Docker est en cours: docker --version"
    echo "   • Relancez avec nettoyage: $0 --clean"
    echo "   • Consultez les logs détaillés des étapes échouées"
    exit 1
fi
