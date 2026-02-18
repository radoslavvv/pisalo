namespace TyperacerAPI.DTOs;

public record AuthResponse(string Token, UserDto User);

public record UserDto(
    string Id,
    string Username,
    string? Avatar,
    bool IsGuest
);

public record CreateGuestRequest(string? Username);

public record ConvertGuestRequest(string Provider);
