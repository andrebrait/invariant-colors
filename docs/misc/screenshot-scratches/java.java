// ## SELECTION STARTS HERE ##
import java.util.List;

interface Matcher {
    boolean matches(String value);
}

record SearchResult(String value, int score) {}

static final class SearchService {
    private static final int LIMIT = 3;
    private final List<String> values;

    SearchService(List<String> values) {
        this.values = List.copyOf(values);
    }

    SearchResult matchesFirst(String prefix) {
        int remaining = LIMIT;
        remaining--;

        Matcher matcher = value -> value.startsWith(prefix);
        String candidate = values.getFirst();
        boolean match = candidate != null && matcher.matches(candidate);
        return match ? new SearchResult(candidate, remaining) : null;
    }
}
// ## SELECTION ENDS HERE ##
