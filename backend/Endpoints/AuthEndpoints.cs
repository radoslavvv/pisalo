using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using TyperacerAPI.Data;
using TyperacerAPI.DTOs;
using TyperacerAPI.Entities;
using TyperacerAPI.Services;

namespace TyperacerAPI.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapGet("/login/google", InitiateGoogleLogin)
            .AllowAnonymous();

        group.MapGet("/login/github", InitiateGitHubLogin)
            .AllowAnonymous();

        group.MapGet("/callback/google", HandleGoogleCallback)
            .AllowAnonymous();

        group.MapGet("/callback/github", HandleGitHubCallback)
            .AllowAnonymous();

        group.MapPost("/guest", CreateGuestSession)
            .AllowAnonymous();

        group.MapGet("/me", GetCurrentUser)
            .RequireAuthorization();

        group.MapPost("/logout", Logout)
            .RequireAuthorization();

        return app;
    }

    private static IResult InitiateGoogleLogin(
        HttpContext context,
        IConfiguration config)
    {
        var frontendUrl = config["FrontendUrl"] ?? "http://localhost:5173";
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/api/auth/callback/google",
            Items =
            {
                { "returnUrl", frontendUrl }
            }
        };

        return Results.Challenge(properties, ["Google"]);
    }

    private static IResult InitiateGitHubLogin(
        HttpContext context,
        IConfiguration config)
    {
        var frontendUrl = config["FrontendUrl"] ?? "http://localhost:5173";
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/api/auth/callback/github",
            Items =
            {
                { "returnUrl", frontendUrl }
            }
        };

        return Results.Challenge(properties, ["GitHub"]);
    }

    private static async Task<IResult> HandleGoogleCallback(
        HttpContext context,
        AppDbContext dbContext,
        IJwtService jwtService,
        IConfiguration config)
    {
        var result = await context.AuthenticateAsync("Google");
        if (!result.Succeeded)
        {
            return Results.Redirect($"{config["FrontendUrl"]}?error=auth_failed");
        }

        return await HandleOAuthCallback(result.Principal!, "Google", dbContext, jwtService, config);
    }

    private static async Task<IResult> HandleGitHubCallback(
        HttpContext context,
        AppDbContext dbContext,
        IJwtService jwtService,
        IConfiguration config)
    {
        var result = await context.AuthenticateAsync("GitHub");
        if (!result.Succeeded)
        {
            return Results.Redirect($"{config["FrontendUrl"]}?error=auth_failed");
        }

        return await HandleOAuthCallback(result.Principal!, "GitHub", dbContext, jwtService, config);
    }

    private static async Task<IResult> HandleOAuthCallback(
        ClaimsPrincipal principal,
        string provider,
        AppDbContext dbContext,
        IJwtService jwtService,
        IConfiguration config)
    {
        var oauthId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var name = principal.FindFirstValue(ClaimTypes.Name) ?? 
                   principal.FindFirstValue("name") ?? 
                   email?.Split('@')[0] ?? 
                   $"user_{Guid.NewGuid().ToString()[..8]}";
        var avatar = principal.FindFirstValue("picture") ?? 
                     principal.FindFirstValue("avatar_url");

        if (string.IsNullOrEmpty(oauthId))
        {
            return Results.Redirect($"{config["FrontendUrl"]}?error=invalid_oauth_response");
        }

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.OAuthProvider == provider && u.OAuthId == oauthId);

        if (user is null)
        {
            var username = await GenerateUniqueUsername(dbContext, name);
            user = User.CreateFromOAuth(provider, oauthId, username, email, avatar);
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();
        }
        else
        {
            user.UpdateLastActive();
            await dbContext.SaveChangesAsync();
        }

        var token = jwtService.GenerateToken(user);
        var frontendUrl = config["FrontendUrl"] ?? "http://localhost:5173";

        return Results.Redirect($"{frontendUrl}/auth/callback?token={token}");
    }

    private static async Task<IResult> CreateGuestSession(
        CreateGuestRequest? request,
        AppDbContext dbContext,
        IJwtService jwtService)
    {
        var baseUsername = request?.Username ?? "Guest";
        var username = await GenerateUniqueUsername(dbContext, baseUsername);

        var user = User.CreateGuest(username);
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);

        return Results.Ok(new AuthResponse(
            token,
            new UserDto(
                user.Id.ToString(),
                user.Username,
                user.AvatarUrl,
                user.IsGuest
            )
        ));
    }

    private static async Task<IResult> GetCurrentUser(
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

        user.UpdateLastActive();
        await dbContext.SaveChangesAsync();

        return Results.Ok(new UserDto(
            user.Id.ToString(),
            user.Username,
            user.AvatarUrl,
            user.IsGuest
        ));
    }

    private static IResult Logout()
    {
        return Results.Ok(new { message = "Logged out successfully" });
    }

    private static async Task<string> GenerateUniqueUsername(AppDbContext dbContext, string baseUsername)
    {
        var sanitized = new string(baseUsername
            .Where(c => char.IsLetterOrDigit(c) || c == '_')
            .Take(20)
            .ToArray());

        if (string.IsNullOrEmpty(sanitized))
        {
            sanitized = "User";
        }

        var username = sanitized;
        var counter = 1;

        while (await dbContext.Users.AnyAsync(u => u.Username == username))
        {
            username = $"{sanitized}{counter}";
            counter++;
        }

        return username;
    }
}
