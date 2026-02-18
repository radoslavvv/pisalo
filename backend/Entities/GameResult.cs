namespace TyperacerAPI.Entities;

public class GameResult
{
    public Guid Id { get; private set; }
    public Guid RoomId { get; private set; }
    public Guid PlayerId { get; private set; }
    public string PlayerUsername { get; private set; } = string.Empty;
    public int WordsTyped { get; private set; }
    public int TotalWords { get; private set; }
    public int Errors { get; private set; }
    public double Wpm { get; private set; }
    public double Accuracy { get; private set; }
    public long ElapsedMs { get; private set; }
    public bool IsWinner { get; private set; }
    public DateTime CompletedAt { get; private set; }

    private GameResult() { }

    public static GameResult Create(
        Guid roomId,
        Guid playerId,
        string playerUsername,
        int wordsTyped,
        int totalWords,
        int errors,
        double wpm,
        double accuracy,
        long elapsedMs,
        bool isWinner)
    {
        return new GameResult
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            PlayerId = playerId,
            PlayerUsername = playerUsername,
            WordsTyped = wordsTyped,
            TotalWords = totalWords,
            Errors = errors,
            Wpm = wpm,
            Accuracy = accuracy,
            ElapsedMs = elapsedMs,
            IsWinner = isWinner,
            CompletedAt = DateTime.UtcNow
        };
    }
}
