using Microsoft.EntityFrameworkCore;
using TyperacerAPI.Entities;

namespace TyperacerAPI.Data;

public static class DatabaseSeeder
{
    private static readonly string[] Usernames =
    [
        "SpeedTyper", "KeyboardNinja", "TypeMaster", "SwiftFingers", "WordWizard",
        "RapidKeys", "FlashTyper", "ProTypist", "KeyStorm", "TypeRacer",
        "QuickKeys", "NimbleFingers", "TypeLord", "SpeedDemon", "KeyboardKing",
        "TypingPro", "FastFingers", "WordRunner", "TypeChamp", "KeyWarrior",
        "BlazingKeys", "TypeStar", "SpeedMaster", "KeyboardAce", "WordSlinger",
        "RapidTyper", "SwiftKeys", "TypeGuru", "KeyboardHero", "SpeedKing",
        "TypeNinja", "QuickFingers", "WordMaster", "KeyLegend", "TypeAce",
        "SpeedTypist", "KeyboardPro", "WordChamp", "TypeWarrior", "SwiftTyper",
        "RapidFingers", "KeyStrike", "TypeHero", "SpeedRunner", "KeyMaster",
        "WordNinja", "TypeKing", "QuickTyper", "KeyboardGod", "SpeedAce"
    ];

    private static readonly string[] GameModes = ["timed", "word-count", "instant-death", "multiplayer"];

    public static async Task SeedAsync(AppDbContext context, bool force = false)
    {
        if (!force && await context.GameResults.AnyAsync())
        {
            return;
        }

        if (force)
        {
            context.GameResults.RemoveRange(context.GameResults);
            await context.SaveChangesAsync();
        }

        var random = new Random(42);
        var results = new List<GameResult>();
        var now = DateTime.UtcNow;

        foreach (var username in Usernames)
        {
            var numResults = random.Next(3, 12);
            var baseWpm = random.Next(40, 120);
            var baseAccuracy = random.NextDouble() * 15 + 85;

            for (int i = 0; i < numResults; i++)
            {
                var gameMode = GameModes[random.Next(GameModes.Length)];
                var wpm = baseWpm + random.Next(-15, 20);
                var accuracy = Math.Min(100, Math.Max(70, baseAccuracy + random.NextDouble() * 10 - 5));

                var daysAgo = random.Next(0, 35);
                var hoursAgo = random.Next(0, 24);
                var completedAt = now.AddDays(-daysAgo).AddHours(-hoursAgo);

                var wordsTyped = gameMode switch
                {
                    "timed" => random.Next(20, 80),
                    "word-count" => random.Next(25, 100),
                    "instant-death" => random.Next(5, 50),
                    "multiplayer" => random.Next(30, 60),
                    _ => random.Next(25, 50)
                };

                var totalWords = gameMode == "word-count" ? wordsTyped : random.Next(wordsTyped, wordsTyped + 20);
                var errors = (int)((100 - accuracy) / 2 * wordsTyped / 10);
                var elapsedMs = (long)(wordsTyped / (wpm / 60.0) * 1000);

                var result = GameResult.Create(
                    roomId: gameMode == "multiplayer" ? Guid.NewGuid() : Guid.Empty,
                    playerId: Guid.NewGuid(),
                    playerUsername: username,
                    wordsTyped: wordsTyped,
                    totalWords: totalWords,
                    errors: errors,
                    wpm: wpm,
                    accuracy: Math.Round(accuracy, 1),
                    elapsedMs: elapsedMs,
                    isWinner: gameMode == "multiplayer" && random.Next(2) == 1,
                    gameMode: gameMode,
                    completedAt: completedAt
                );

                results.Add(result);
            }
        }

        context.GameResults.AddRange(results);
        await context.SaveChangesAsync();

        Console.WriteLine($"Seeded {results.Count} game results for leaderboard testing.");
    }
}
