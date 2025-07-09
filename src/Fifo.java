import java.util.LinkedList;

public class Fifo {
    private LinkedList<Integer> queue;
    
    public Fifo() {
        queue = new LinkedList<>();
    }

    public void enqueue(int value) {
        queue.addLast(value);
    }

    public Integer dequeue() {
        if (queue.isEmpty()) {
            return null; 
        }
        return queue.removeFirst();
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

    public Integer peek() {
        if (queue.isEmpty()) {
            return null; 
        }
        return queue.getFirst();
    }

    @Override
    public String toString() {
        return queue.toString();
    }
    
}
