import java.util.HashMap;
import java.util.Map;

public class TaskService {
    private final Fifo fifo = new Fifo();
    private final Map<Integer, Task> guichetMap = new HashMap<>();

    public String enqueue(int value) {
        fifo.enqueue(new Task(value));
        return "✔️ Ticket ajouté : " + value;
    }

    public String peek() {
        Task task = fifo.peek();
        return (task == null) ? "❌ File vide" : "👀 Prochain ticket : " + task.getValue();
    }

    public String dequeue() {
        Task task = fifo.dequeue();
        return (task == null) ? "❌ File vide" : "✔️ Ticket retiré : " + task.getValue();
    }

    public String size() {
        return "📏 Taille de la file : " + fifo.size();
    }

    public String isEmpty() {
        return fifo.isEmpty() ? "✅ La file est vide" : "❌ La file n'est pas vide";
    }

    public synchronized String nextForGuichet(int guichetId) {
        Task currentTask = guichetMap.get(guichetId);

        if (fifo.isEmpty()) {
            return "❌ Aucun ticket à appeler";
        }

        Task nextTask = null;

        while (!fifo.isEmpty()) {
            Task candidate = fifo.dequeue();

            boolean alreadyAssigned = guichetMap.values().stream()
                    .anyMatch(t -> t.getValue() == candidate.getValue());

            if (alreadyAssigned) {
                
                continue;
            }

            
            if (currentTask != null && candidate.getValue() == currentTask.getValue()) {
                
                continue;
            }

            nextTask = candidate;
            break;
        }

        if (nextTask == null) {
            return "❌ Aucun nouveau ticket disponible";
        }

        guichetMap.put(guichetId, nextTask);
        return "🎫 Guichet " + guichetId + " → Ticket " + nextTask.getValue();
    }

    public String getCurrentTicketForGuichet(int guichetId) {
        Task task = guichetMap.get(guichetId);
        return (task == null)
                ? "ℹ️ Aucun ticket en cours pour le guichet " + guichetId
                : "🔔 Guichet " + guichetId + " appelle le ticket " + task.getValue();
    }

    public String getAllGuichets() {
        if (guichetMap.isEmpty())
            return "Aucun guichet actif.";
        StringBuilder result = new StringBuilder("📋 Tickets en cours :\n");
        guichetMap.forEach((id, task) -> result.append(" - Guichet ").append(id).append(" : Ticket ")
                .append(task.getValue()).append("\n"));
        return result.toString();
    }
}
