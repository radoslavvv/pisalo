namespace TyperacerAPI.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? AvatarUrl { get; private set; }
    public string? OAuthProvider { get; private set; }
    public string? OAuthId { get; private set; }
    public bool IsGuest { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime LastActiveAt { get; private set; }

    private User() { }

    public static User CreateGuest(string username)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            IsGuest = true,
            CreatedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow
        };
    }

    public static User CreateFromOAuth(
        string oauthProvider,
        string oauthId,
        string username,
        string? email,
        string? avatarUrl)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            AvatarUrl = avatarUrl,
            OAuthProvider = oauthProvider,
            OAuthId = oauthId,
            IsGuest = false,
            CreatedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow
        };
    }

    public void UpdateLastActive()
    {
        LastActiveAt = DateTime.UtcNow;
    }

    public void LinkToOAuth(string oauthProvider, string oauthId, string? email, string? avatarUrl)
    {
        OAuthProvider = oauthProvider;
        OAuthId = oauthId;
        Email = email;
        AvatarUrl = avatarUrl;
        IsGuest = false;
        LastActiveAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string? avatarUrl)
    {
        if (avatarUrl is not null)
        {
            AvatarUrl = avatarUrl;
        }
        LastActiveAt = DateTime.UtcNow;
    }
}
