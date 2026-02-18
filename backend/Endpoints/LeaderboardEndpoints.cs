using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TyperacerAPI.Data;
using TyperacerAPI.DTOs;
using TyperacerAPI.Entities;

namespace TyperacerAPI.Endpoints;

public static class LeaderboardEndpoints
{
    public static IEndpointRouteBuilder MapLeaderboardEndpoints(this IEndpointRouteBuilder app)
    {
        var leaderboardGroup = app.MapGroup("/api/leaderboard")
            .WithTags("Leaderboard");

        leaderboardGroup.MapGet("/", GetLeaderboard)
            .AllowAnonymous();

        leaderboardGroup.MapPost("/seed", SeedLeaderboard)
            .AllowAnonymous();

        var gamesGroup = app.MapGroup("/api/games")
            .WithTags("Games");

        gamesGroup.MapPost("/results", SaveGameResult)
            .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> SeedLeaderboard(
        AppDbContext dbContext,
        IWebHostEnvironment env,
        bool force = false)
    {
        if (!env.IsDevelopment())
        {
            return Results.NotFound();
        }

        await DatabaseSeeder.SeedAsync(dbContext, force);
        var count = await dbContext.GameResults.CountAsync();

        return Results.Ok(new { message = $"Database seeded successfully", totalResults = count });
    }

    private static async Task<IResult> GetLeaderboard(
        AppDbContext dbContext,
        string? gameMode = null,
        string? period = "all-time",
        int page = 1,
        int pageSize = 100)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = dbContext.GameResults.AsQueryable();

        if (!string.IsNullOrEmpty(gameMode))
        {
            query = query.Where(r => r.GameMode == gameMode);
        }

        var now = DateTime.UtcNow;
        query = period?.ToLower() switch
        {
            "daily" => query.Where(r => r.CompletedAt >= now.Date),
            "weekly" => query.Where(r => r.CompletedAt >= now.AddDays(-(int)now.DayOfWeek)),
            "monthly" => query.Where(r => r.CompletedAt >= new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc)),
            _ => query
        };

        var totalCount = await query.CountAsync();

        // Primary sort: effective WPM (WPM × accuracy) so both speed and accuracy matter
        // Then by raw WPM, then accuracy for tie-breaking
        var results = await query
            .OrderByDescending(r => r.Wpm * r.Accuracy / 100.0)
            .ThenByDescending(r => r.Wpm)
            .ThenByDescending(r => r.Accuracy)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.PlayerUsername,
                r.Wpm,
                r.Accuracy,
                r.CompletedAt,
                r.GameMode
            })
            .ToListAsync();

        var entries = results
            .Select((r, index) => new LeaderboardEntryDto(
                Rank: (page - 1) * pageSize + index + 1,
                Username: r.PlayerUsername,
                Wpm: Math.Round(r.Wpm, 1),
                Accuracy: Math.Round(r.Accuracy, 1),
                Date: r.CompletedAt.ToString("yyyy-MM-dd"),
                GameMode: r.GameMode
            ))
            .ToList();

        return Results.Ok(new LeaderboardResponse(
            Entries: entries,
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    private static async Task<IResult> SaveGameResult(
        SaveGameResultRequest request,
        ClaimsPrincipal principal,
        AppDbContext dbContext)
    {
        var userIdClaim = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? principal.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var user = await dbContext.Users.FindAsync(userId);
        if (user is null)
        {
            return Results.NotFound(new { message = "User not found" });
        }

        if (user.IsGuest)
        {
            return Results.BadRequest(new { message = "Guest users cannot save results to the leaderboard" });
        }

        var validModes = new[] { "timed", "word-count", "instant-death", "zen" };
        if (!validModes.Contains(request.GameMode))
        {
            return Results.BadRequest(new { message = "Invalid game mode" });
        }

        if (request.GameMode == "zen")
        {
            return Results.Ok(new { message = "Zen mode results are not saved to leaderboard" });
        }

        var gameResult = GameResult.Create(
            roomId: Guid.Empty,
            playerId: userId,
            playerUsername: user.Username,
            wordsTyped: request.WordsTyped,
            totalWords: request.TotalWords,
            errors: request.Errors,
            wpm: request.Wpm,
            accuracy: request.Accuracy,
            elapsedMs: request.ElapsedMs,
            isWinner: false,
            gameMode: request.GameMode
        );

        dbContext.GameResults.Add(gameResult);
        await dbContext.SaveChangesAsync();

        return Results.Ok(new { message = "Result saved successfully" });
    }
}
