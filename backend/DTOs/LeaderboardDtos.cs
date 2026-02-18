namespace TyperacerAPI.DTOs;

public record LeaderboardEntryDto(
    int Rank,
    string Username,
    double Wpm,
    double Accuracy,
    string Date,
    string GameMode
);

public record LeaderboardResponse(
    List<LeaderboardEntryDto> Entries,
    int TotalCount,
    int Page,
    int PageSize
);

public record SaveGameResultRequest(
    string GameMode,
    int WordsTyped,
    int TotalWords,
    int Errors,
    double Wpm,
    double Accuracy,
    long ElapsedMs
);
