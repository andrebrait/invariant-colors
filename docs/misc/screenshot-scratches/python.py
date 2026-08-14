# ## SELECTION STARTS HERE ##
class PathMatcher:
    def __init__(self, prefix):
        self.prefix = prefix

    def matches(self, value):
        return value.startswith(self.prefix)


class SearchService:
    LIMIT = 3

    def __init__(self, values):
        self.values = values

    def find(self, prefix, matcher):
        normalized = prefix.strip()
        normalized = normalized.lower()

        return [
            value
            for value in self.values[: self.LIMIT]
            if value.lower().startswith(normalized) and matcher.matches(value)
        ]


files = ["src/main.py", "test_main.py"]
service = SearchService(files)
path_matcher = PathMatcher("src/")
results = service.find("src", path_matcher)
# ## SELECTION ENDS HERE ##
