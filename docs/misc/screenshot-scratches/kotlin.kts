// ## SELECTION STARTS HERE ##
fun interface Matcher {
    fun matches(value: String): Boolean
}

data class SearchResult(val value: String, val score: Int)

class SearchService(private val values: List<String>) {
    fun find(prefix: String, matcher: Matcher): List<SearchResult> {
        var normalized = prefix.trim()
        normalized = normalized.lowercase()

        return values.asSequence()
            .filter { value -> matcher.matches(value) }
            .take(LIMIT)
            .map { value -> SearchResult(normalized + value, value.length) }
            .toList()
    }

    private companion object {
        const val LIMIT = 3
    }
}

val service = SearchService(listOf("src/Main.kt", "README.md"))
val results = service.find("src/") { value -> value.endsWith(".kt") }
check(results.isNotEmpty())
// ## SELECTION ENDS HERE ##
