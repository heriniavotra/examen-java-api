import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class ApiTest {
    private static final String BASE_URL = "http://localhost:8081";
    private static final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    
    private static int testsPassed = 0;
    private static int testsTotal = 0;

    public static void main(String[] args) {
        System.out.println("🚀 Démarrage des tests automatiques de l'API REST");
        System.out.println("=" + "=".repeat(50));
        
        // Vérifier que le serveur est démarré
        if (!isServerRunning()) {
            System.out.println("❌ Le serveur n'est pas accessible sur " + BASE_URL);
            System.out.println("💡 Démarrez d'abord le serveur avec: java -cp bin Main");
            return;
        }
        
        System.out.println("✅ Serveur accessible sur " + BASE_URL);
        System.out.println();
        
        // Exécuter tous les tests
        testResetQueue();
        testEnqueueTicket();
        testPeekTicket();
        testQueueSize();
        testIsEmpty();
        testDequeueTicket();
        testCompleteEmptyQueue(); // Nouveau test pour vider complètement la file
        testGuichetOperations();
        testErrorCases();
        
        // Résumé des tests
        System.out.println("=" + "=".repeat(50));
        System.out.printf("📊 Résultats: %d/%d tests réussis (%.1f%%)\n", 
                testsPassed, testsTotal, (testsTotal > 0 ? (double)testsPassed/testsTotal*100 : 0));
        
        if (testsPassed == testsTotal) {
            System.out.println("🎉 Tous les tests sont passés avec succès!");
            System.exit(0); // Code de sortie 0 pour succès
        } else {
            System.out.println("⚠️  Certains tests ont échoué. Vérifiez l'implémentation.");
            System.out.printf("❌ %d test(s) ont échoué sur %d\n", (testsTotal - testsPassed), testsTotal);
            System.exit(1); // Code de sortie 1 pour échec
        }
    }
    
    private static boolean isServerRunning() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/isEmpty"))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }
    
    private static void testResetQueue() {
        System.out.println("🧹 Test: Reset de la file");
        
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/reset"))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertTest("Reset queue", response.statusCode() == 200, 
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Reset queue", false, "Exception: " + e.getMessage());
        }
    }
    
    private static void testEnqueueTicket() {
        System.out.println("➕ Test: Ajout de tickets");
        
        // Test ajout de plusieurs tickets
        int[] tickets = {101, 102, 103};
        
        for (int ticket : tickets) {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/tickets/enqueue"))
                        .header("Content-Type", "text/plain")
                        .POST(HttpRequest.BodyPublishers.ofString(String.valueOf(ticket)))
                        .build();
                
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                assertTest("Enqueue ticket " + ticket, response.statusCode() == 200,
                        "Status: " + response.statusCode() + ", Body: " + response.body());
            } catch (Exception e) {
                assertTest("Enqueue ticket " + ticket, false, "Exception: " + e.getMessage());
            }
        }
    }
    
    private static void testPeekTicket() {
        System.out.println("👀 Test: Consultation du prochain ticket");
        
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/peek"))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            boolean success = response.statusCode() == 200 && response.body().contains("101");
            assertTest("Peek ticket", success,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Peek ticket", false, "Exception: " + e.getMessage());
        }
    }
    
    private static void testQueueSize() {
        System.out.println("📏 Test: Taille de la file");
        
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/size"))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            boolean success = response.statusCode() == 200 && response.body().contains("3");
            assertTest("Queue size", success,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Queue size", false, "Exception: " + e.getMessage());
        }
    }
    
    private static void testIsEmpty() {
        System.out.println("❓ Test: File vide");
        
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/isEmpty"))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            // Accepter différents formats de réponse pour "non vide"
            String body = response.body().toLowerCase();
            boolean success = response.statusCode() == 200 && 
                            (body.contains("false") || body.contains("n'est pas vide") || body.contains("not empty"));
            assertTest("Is empty (should be false)", success,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Is empty (should be false)", false, "Exception: " + e.getMessage());
        }
    }
    
    private static void testDequeueTicket() {
        System.out.println("➖ Test: Retrait de tickets");
        
        // Retirer le premier ticket (devrait être 101)
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/dequeue"))
                    .DELETE()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            boolean success = response.statusCode() == 200 && response.body().contains("101");
            assertTest("Dequeue first ticket", success,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Dequeue first ticket", false, "Exception: " + e.getMessage());
        }
    }
    
    private static void testCompleteEmptyQueue() {
        System.out.println("🗑️  Test: Vider complètement la file");
        
        // Continuer à retirer des tickets jusqu'à ce que la file soit vide
        for (int i = 0; i < 10; i++) { // Limite pour éviter une boucle infinie
            try {
                // Vérifier d'abord si la file est vide
                HttpRequest checkRequest = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/tickets/isEmpty"))
                        .GET()
                        .build();
                
                HttpResponse<String> checkResponse = client.send(checkRequest, HttpResponse.BodyHandlers.ofString());
                String body = checkResponse.body().toLowerCase();
                
                if (body.contains("true") || body.contains("vide")) {
                    assertTest("Queue completely emptied", true, "Queue is now empty after " + i + " dequeues");
                    return;
                }
                
                // Si pas vide, continuer à retirer
                HttpRequest dequeueRequest = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/tickets/dequeue"))
                        .DELETE()
                        .build();
                
                HttpResponse<String> dequeueResponse = client.send(dequeueRequest, HttpResponse.BodyHandlers.ofString());
                if (dequeueResponse.statusCode() != 200) {
                    assertTest("Queue completely emptied", false, 
                            "Failed to dequeue: " + dequeueResponse.statusCode() + " - " + dequeueResponse.body());
                    return;
                }
            } catch (Exception e) {
                assertTest("Queue completely emptied", false, "Exception: " + e.getMessage());
                return;
            }
        }
        
        assertTest("Queue completely emptied", false, "Could not empty queue after 10 attempts");
    }
    
    private static void testGuichetOperations() {
        System.out.println("🏢 Test: Opérations sur les guichets");
        
        // Test récupération du prochain ticket pour guichet 1
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/guichet/1/next"))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertTest("Guichet 1 next ticket", response.statusCode() == 200,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Guichet 1 next ticket", false, "Exception: " + e.getMessage());
        }
        
        // Test consultation du ticket actuel du guichet 1
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/guichet/1"))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertTest("Guichet 1 current ticket", response.statusCode() == 200,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Guichet 1 current ticket", false, "Exception: " + e.getMessage());
        }
        
        // Test liste de tous les guichets
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/guichets"))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertTest("List all guichets", response.statusCode() == 200,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("List all guichets", false, "Exception: " + e.getMessage());
        }
    }
    
    private static void testErrorCases() {
        System.out.println("❌ Test: Cas d'erreur");
        
        // Test route inexistante
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/nonexistent"))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertTest("Non-existent route", response.statusCode() == 404,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Non-existent route", false, "Exception: " + e.getMessage());
        }
        
        // Test méthode non autorisée
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/peek"))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertTest("Method not allowed", response.statusCode() == 405,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Method not allowed", false, "Exception: " + e.getMessage());
        }
        
        // Test enqueue avec valeur invalide
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/tickets/enqueue"))
                    .header("Content-Type", "text/plain")
                    .POST(HttpRequest.BodyPublishers.ofString("invalid"))
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertTest("Invalid enqueue value", response.statusCode() == 400,
                    "Status: " + response.statusCode() + ", Body: " + response.body());
        } catch (Exception e) {
            assertTest("Invalid enqueue value", false, "Exception: " + e.getMessage());
        }
    }
    
    private static void assertTest(String testName, boolean condition, String details) {
        testsTotal++;
        if (condition) {
            testsPassed++;
            System.out.println("  ✅ " + testName + " - RÉUSSI");
        } else {
            System.out.println("  ❌ " + testName + " - ÉCHOUÉ");
            System.out.println("     Détails: " + details);
        }
    }
}
