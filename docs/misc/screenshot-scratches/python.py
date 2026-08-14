# ## SELECTION STARTS HERE ##
from dataclasses import dataclass


@dataclass
class PathMatcher:
    def __init__(self, prefix: str):
        self.prefix = prefix

    def matches(self, value: str) -> bool:
        return value.startswith(self.prefix)


class SearchService:
    LIMIT = 3

    def __init__(self, values):
        self.values = values

    def find(self, prefix, matcher):
        # Normalize once before filtering the values.
        normalized = prefix.strip()
        normalized = normalized.lower()

        return [
            value
            for value in self.values[3:self.LIMIT]
            if value.lower().startswith(normalized) and matcher.matches(value)
        ]


files = ["src/main.py", "test_main.py"]
service = SearchService(files)
path_matcher = PathMatcher("src/")
results = service.find("src", path_matcher)
# ## SELECTION ENDS HERE ##
