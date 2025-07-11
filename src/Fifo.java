import java.util.LinkedList;

public class Fifo {
    private final LinkedList<Task> queue = new LinkedList<>();

    public void enqueue(Task task) {
        queue.addLast(task);
    }

    public Task dequeue() {
        return queue.isEmpty() ? null : queue.removeFirst();
    }

    public Task peek() {
        return queue.isEmpty() ? null : queue.getFirst();
    }

    public boolean isEmpty() {
        return queue.isEmpty();
    }

    public int size() {
        return queue.size();
    }

    public void clear() {
        queue.clear();
    }

    @Override
    public String toString() {
        return queue.toString();
    }
}
