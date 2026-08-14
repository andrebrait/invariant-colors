// ## SELECTION STARTS HERE ##
private static List<String> filter(List<String> strings, char expected) {
    String charAsString = String.valueOf(expected);
    return strings.stream()
            .filter(s -> s.contains(charAsString))
            .filter(s -> s.charAt(0) == expected)
            .peek(s -> {
                System.err.printf("Found char %c in string %s\n", expected, s);
                log(s, expected);
            })
            .collect(Collectors.toList());
}
// ## SELECTION ENDS HERE ##
