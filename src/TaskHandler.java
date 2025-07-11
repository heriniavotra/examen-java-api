import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class TaskHandler implements HttpHandler {

    private final TaskService service = new TaskService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();

        handleCors(exchange);

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // Routes statiques
        switch (path) {
            case "/tickets/enqueue":
                if ("POST".equals(method)) handleEnqueue(exchange);
                else respondMethodNotAllowed(exchange);
                return;

            case "/tickets/peek":
                if ("GET".equals(method)) respond(exchange, 200, service.peek());
                else respondMethodNotAllowed(exchange);
                return;

            case "/tickets/dequeue":
                if ("DELETE".equals(method)) respond(exchange, 200, service.dequeue());
                else respondMethodNotAllowed(exchange);
                return;

            case "/tickets/size":
                if ("GET".equals(method)) respond(exchange, 200, service.size());
                else respondMethodNotAllowed(exchange);
                return;

            case "/tickets/isEmpty":
                if ("GET".equals(method)) respond(exchange, 200, service.isEmpty());
                else respondMethodNotAllowed(exchange);
                return;
        }

        // Routes dynamiques
        if (path.matches("/tickets/guichet/\\d+/next")) {
            if ("POST".equals(method)) {
                try {
                    int guichetId = Integer.parseInt(path.split("/")[3]);
                    respond(exchange, 200, service.nextForGuichet(guichetId));
                } catch (NumberFormatException e) {
                    respond(exchange, 400, "❌ Numéro de guichet invalide");
                }
            } else {
                respondMethodNotAllowed(exchange);
            }
            return;
        }

        if (path.matches("/tickets/guichet/\\d+")) {
            if ("GET".equals(method)) {
                try {
                    int guichetId = Integer.parseInt(path.split("/")[3]);
                    respond(exchange, 200, service.getCurrentTicketForGuichet(guichetId));
                } catch (NumberFormatException e) {
                    respond(exchange, 400, "❌ Numéro de guichet invalide");
                }
            } else {
                respondMethodNotAllowed(exchange);
            }
            return;
        }

        if ("/tickets/guichets".equals(path)) {
            if ("GET".equals(method)) {
                respond(exchange, 200, service.getAllGuichets());
            } else {
                respondMethodNotAllowed(exchange);
            }
            return;
        }

        // Route non reconnue
        respond(exchange, 404, "❌ Route non trouvée");
    }

    private void handleEnqueue(HttpExchange exchange) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8));
        String body = reader.readLine();
        if (body == null || body.isEmpty()) {
            respond(exchange, 400, "❌ Corps de la requête vide");
            return;
        }

        try {
            int value = Integer.parseInt(body.trim());
            respond(exchange, 200, service.enqueue(value));
        } catch (NumberFormatException e) {
            respond(exchange, 400, "❌ Valeur invalide");
        }
    }

    private void respond(HttpExchange exchange, int statusCode, String message) throws IOException {
        byte[] response = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, response.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }

    private void respondMethodNotAllowed(HttpExchange exchange) throws IOException {
        respond(exchange, 405, "❌ Méthode non autorisée");
    }

    private void handleCors(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "*");
    }
}
