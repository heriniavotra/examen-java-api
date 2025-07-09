import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public class Main {

    public static void main(String[] args) throws IOException {
        int port = 8081;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/", exchange -> {
            String msg = "✅ Bienvenue sur l'API FIFO Java";
            sendResponse(exchange, 200, msg);
        });
      
        server.createContext("/tickets", new TaskHandler());

        server.setExecutor(null);
        System.out.println("✅ Serveur HTTP démarré sur le port " + port);
        server.start();
    }

    private static void sendResponse(com.sun.net.httpserver.HttpExchange exchange, int statusCode, String response)
            throws IOException {
        exchange.sendResponseHeaders(statusCode, response.getBytes().length);
        try (java.io.OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }
}
