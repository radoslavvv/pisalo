namespace TyperacerAPI.Entities;

public enum RoomStatus
{
    Waiting,
    Playing,
    Finished,
    Abandoned
}

public class GameRoom
{
    public Guid Id { get; private set; }
    public string RoomCode { get; private set; } = string.Empty;
    public Guid HostId { get; private set; }
    public string HostUsername { get; private set; } = string.Empty;
    public string? HostConnectionId { get; private set; }
    public Guid? GuestId { get; private set; }
    public string? GuestUsername { get; private set; }
    public string? GuestConnectionId { get; private set; }
    public RoomStatus Status { get; private set; }
    public string? WordsSerialized { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? FinishedAt { get; private set; }

    private GameRoom() { }

    public static GameRoom Create(Guid hostId, string hostUsername, string roomCode, string hostConnectionId)
    {
        return new GameRoom
        {
            Id = Guid.NewGuid(),
            RoomCode = roomCode,
            HostId = hostId,
            HostUsername = hostUsername,
            HostConnectionId = hostConnectionId,
            Status = RoomStatus.Waiting,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool CanJoin() => Status == RoomStatus.Waiting && GuestId is null;

    public void AddGuest(Guid guestId, string guestUsername, string guestConnectionId)
    {
        if (!CanJoin())
            throw new InvalidOperationException("Room is not available for joining");

        GuestId = guestId;
        GuestUsername = guestUsername;
        GuestConnectionId = guestConnectionId;
    }

    public void RemoveGuest()
    {
        GuestId = null;
        GuestUsername = null;
        GuestConnectionId = null;
    }

    public void StartGame(string[] words)
    {
        if (Status != RoomStatus.Waiting || GuestId is null)
            throw new InvalidOperationException("Cannot start game: room not ready");

        Status = RoomStatus.Playing;
        WordsSerialized = string.Join("|", words);
        StartedAt = DateTime.UtcNow;
    }

    public string[] GetWords()
    {
        return WordsSerialized?.Split('|') ?? [];
    }

    public void FinishGame()
    {
        Status = RoomStatus.Finished;
        FinishedAt = DateTime.UtcNow;
    }

    public void Abandon()
    {
        Status = RoomStatus.Abandoned;
        FinishedAt = DateTime.UtcNow;
    }

    public void UpdateHostConnection(string connectionId)
    {
        HostConnectionId = connectionId;
    }

    public void UpdateGuestConnection(string connectionId)
    {
        GuestConnectionId = connectionId;
    }

    public bool IsHost(Guid userId) => HostId == userId;
    public bool IsGuest(Guid userId) => GuestId == userId;
    public bool IsParticipant(Guid userId) => IsHost(userId) || IsGuest(userId);
}
