// ## SELECTION STARTS HERE ##
fun interface Matcher {
    fun matches(value: String): Boolean
}

@JvmInline
value class Score(val value: Int)

data class SearchResult(val value: String, val score: Score)

class SearchService(private val values: List<String>) {
    fun find(prefix: String, matcher: Matcher): List<SearchResult> {
        // Normalize once before entering the lazy pipeline.
        var normalized = prefix.trim()
        normalized = normalized.lowercase()

        return values.asSequence()
            .filter { value -> matcher.matches(value) }
            .take(LIMIT)
            .map { value -> SearchResult(normalized + value, Score(value.length)) }
            .toList()
    }

    private companion object {
        const val LIMIT = 3
    }
}

// ## SELECTION ENDS HERE ##

fun main() {
    val service = SearchService(listOf("src/Main.kt", "README.md"))
    val results = service.find("src/") { value -> value.endsWith(".kt") }
    check(results.isNotEmpty())
}
