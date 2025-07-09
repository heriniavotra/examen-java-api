
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class TaskHandler implements HttpHandler {

    private static final Fifo queue = new Fifo();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        switch (path) {
            case "/tickets/enqueue":
                if ("POST".equalsIgnoreCase(method))
                    handleEnqueue(exchange);
                else
                    respondMethodNotAllowed(exchange);
                break;

            case "/tickets/peek":
                if ("GET".equalsIgnoreCase(method))
                    handlePeek(exchange);
                else
                    respondMethodNotAllowed(exchange);
                break;

            case "/tickets/dequeue":
                if ("DELETE".equalsIgnoreCase(method))
                    handleDequeue(exchange);
                else
                    respondMethodNotAllowed(exchange);
                break;

            case "/tickets/size":
                if ("GET".equalsIgnoreCase(method))
                    handleSize(exchange);
                else
                    respondMethodNotAllowed(exchange);
                break;

            default:
                respond(exchange, 404, "❌ Route non trouvée");
        }
    }

    private void handleEnqueue(HttpExchange exchange) throws IOException {
        String body = new BufferedReader(new InputStreamReader(exchange.getRequestBody())).readLine();
        try {
            int value = Integer.parseInt(body.trim());
            queue.enqueue(value);
            respond(exchange, 200, "✔️ Ticket ajouté : " + value);
        } catch (Exception e) {
            respond(exchange, 400, "❌ Valeur invalide");
        }
    }

    private void handlePeek(HttpExchange exchange) throws IOException {
        if (queue.isEmpty()) {
            respond(exchange, 404, "❌ File vide");
        } else {
            int value = queue.peek();
            respond(exchange, 200, "👀 Prochain ticket : " + value);
        }
    }

    private void handleDequeue(HttpExchange exchange) throws IOException {
        if (queue.isEmpty()) {
            respond(exchange, 404, "❌ File vide");
        } else {
            int value = queue.dequeue();
            respond(exchange, 200, "✔️ Ticket retiré : " + value);
        }
    }

    private void respond(HttpExchange exchange, int statusCode, String message) throws IOException {
        byte[] response = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, response.length);
        OutputStream os = exchange.getResponseBody();
        os.write(response);
        os.close();
    }

    private void respondMethodNotAllowed(HttpExchange exchange) throws IOException {
        respond(exchange, 405, "❌ Méthode non autorisée");
    }

    private void handleSize(HttpExchange exchange) throws IOException {
        int size = queue.size();
        respond(exchange, 200, "📏 Taille de la file : " + size);
    }
}
