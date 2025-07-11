import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Main {

    public static void main(String[] args) throws IOException {
        int port = 8081;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

       server.createContext("/swagger.yaml", exchange -> {
            try {
                byte[] content = Files.readAllBytes(Paths.get("swagger.yaml"));
                exchange.getResponseHeaders().set("Content-Type", "application/yaml");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.sendResponseHeaders(200, content.length);
                exchange.getResponseBody().write(content);
            } catch (IOException e) {
                String errorMsg = "Erreur lors de la lecture du fichier swagger.yaml";
                exchange.sendResponseHeaders(500, errorMsg.length());
                exchange.getResponseBody().write(errorMsg.getBytes());
            }
            exchange.close();
        });
 
        server.createContext("/", exchange -> {
            String swaggerUI = generateSwaggerUI();
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, swaggerUI.getBytes().length);
            exchange.getResponseBody().write(swaggerUI.getBytes());
            exchange.close();
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

    private static String generateSwaggerUI() {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>Swagger UI</title>\n" +
                "  <link rel=\"stylesheet\" href=\"https://unpkg.com/swagger-ui-dist/swagger-ui.css\" />\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div id=\"swagger-ui\"></div>\n" +
                "  <script src=\"https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js\"></script>\n" +
                "  <script>\n" +
                "    window.onload = function() {\n" +
                "      SwaggerUIBundle({\n" +
                "        url: '/swagger.yaml',\n" +
                "        dom_id: '#swagger-ui',\n" +
                "      });\n" +
                "    };\n" +
                "  </script>\n" +
                "</body>\n" +
                "</html>";
    }
}
