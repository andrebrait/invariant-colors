// ## SELECTION STARTS HERE ##
import java.util.List;

@FunctionalInterface
interface Matcher {
    boolean matches(String value);
}

record SearchResult(String value, int score) {}

static final class SearchService {
    private static final int LIMIT = 3;
    private final List<String> values;

    SearchService(List<String> values) {
        // Normalize the source collection at the boundary.
        this.values = List.copyOf(values);
    }

    SearchResult matchesFirst() {
        int remaining = LIMIT;
        remaining--;

        Matcher matcher = value -> !value.isBlank();
        String candidate = values.getFirst();
        boolean match = candidate != null && matcher.matches(candidate);
        return match ? new SearchResult(candidate, remaining) : null;
    }
}
// ## SELECTION ENDS HERE ##

void main(){
    SearchResult sr = new SearchService(List.of("a")).matchesFirst();
}
