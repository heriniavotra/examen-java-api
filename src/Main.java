import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
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
                exchange.getResponseHeaders().set("Content-Type", "application/x-yaml");
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.sendResponseHeaders(200, content.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(content);
                }
            } catch (IOException e) {
                String errorMsg = "Erreur lors de la lecture du fichier swagger.yaml";
                exchange.sendResponseHeaders(500, errorMsg.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(errorMsg.getBytes());
                }
            } finally {
                exchange.close();
            }
        });

        server.createContext("/", exchange -> {
            String html = generateSwaggerUI();
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, html.getBytes().length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(html.getBytes());
            } finally {
                exchange.close();
            }
        });

        server.createContext("/tickets", new TaskHandler());

        server.setExecutor(null);
        System.out.println("✅ Serveur HTTP démarré sur le port " + port);
        server.start();
    }

    private static String generateSwaggerUI() {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"fr\">\n" +
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
