using System.Collections.Concurrent;
using TyperacerAPI.Entities;

namespace TyperacerAPI.Services;

public record PlayerInfo(Guid Id, string Username, string ConnectionId);

public record RoomState(
    Guid Id,
    string RoomCode,
    PlayerInfo Host,
    PlayerInfo? Guest,
    RoomStatus Status,
    string[]? Words,
    DateTime CreatedAt,
    DateTime? StartedAt
);

public record PlayerProgress(
    Guid PlayerId,
    string Username,
    int CurrentWordIndex,
    int CurrentCharIndex,
    double Wpm,
    int Errors,
    bool IsFinished
);

public interface IRoomService
{
    RoomState CreateRoom(Guid hostId, string hostUsername, string connectionId);
    RoomState? JoinRoom(string roomCode, Guid guestId, string guestUsername, string connectionId);
    RoomState? GetRoom(string roomCode);
    RoomState? GetRoomByConnectionId(string connectionId);
    RoomState? LeaveRoom(string connectionId);
    RoomState? StartGame(string roomCode, string[] words);
    void UpdatePlayerProgress(string roomCode, Guid playerId, PlayerProgress progress);
    PlayerProgress? GetOpponentProgress(string roomCode, Guid playerId);
    RoomState? FinishGame(string roomCode);
    void RemoveRoom(string roomCode);
    bool IsHost(string roomCode, string connectionId);
}

public class RoomService : IRoomService
{
    private readonly ConcurrentDictionary<string, GameRoom> _rooms = new();
    private readonly ConcurrentDictionary<string, string> _connectionToRoom = new();
    private readonly ConcurrentDictionary<string, PlayerProgress> _playerProgress = new();
    private static readonly char[] RoomCodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray();

    public RoomState CreateRoom(Guid hostId, string hostUsername, string connectionId)
    {
        var roomCode = GenerateRoomCode();
        var room = GameRoom.Create(hostId, hostUsername, roomCode, connectionId);
        
        _rooms[roomCode] = room;
        _connectionToRoom[connectionId] = roomCode;

        return ToRoomState(room);
    }

    public RoomState? JoinRoom(string roomCode, Guid guestId, string guestUsername, string connectionId)
    {
        roomCode = roomCode.ToUpperInvariant();
        
        if (!_rooms.TryGetValue(roomCode, out var room))
            return null;

        if (!room.CanJoin())
            return null;

        room.AddGuest(guestId, guestUsername, connectionId);
        _connectionToRoom[connectionId] = roomCode;

        return ToRoomState(room);
    }

    public RoomState? GetRoom(string roomCode)
    {
        roomCode = roomCode.ToUpperInvariant();
        return _rooms.TryGetValue(roomCode, out var room) ? ToRoomState(room) : null;
    }

    public RoomState? GetRoomByConnectionId(string connectionId)
    {
        if (!_connectionToRoom.TryGetValue(connectionId, out var roomCode))
            return null;

        return GetRoom(roomCode);
    }

    public RoomState? LeaveRoom(string connectionId)
    {
        if (!_connectionToRoom.TryRemove(connectionId, out var roomCode))
            return null;

        if (!_rooms.TryGetValue(roomCode, out var room))
            return null;

        if (room.HostConnectionId == connectionId)
        {
            room.Abandon();
            _rooms.TryRemove(roomCode, out _);
            
            if (room.GuestConnectionId is not null)
                _connectionToRoom.TryRemove(room.GuestConnectionId, out _);
            
            return ToRoomState(room);
        }

        if (room.GuestConnectionId == connectionId)
        {
            room.RemoveGuest();
            return ToRoomState(room);
        }

        return null;
    }

    public RoomState? StartGame(string roomCode, string[] words)
    {
        roomCode = roomCode.ToUpperInvariant();
        
        if (!_rooms.TryGetValue(roomCode, out var room))
            return null;

        room.StartGame(words);
        
        var hostProgressKey = $"{roomCode}:{room.HostId}";
        var guestProgressKey = $"{roomCode}:{room.GuestId}";
        
        _playerProgress[hostProgressKey] = new PlayerProgress(room.HostId, room.HostUsername, 0, 0, 0, 0, false);
        _playerProgress[guestProgressKey] = new PlayerProgress(room.GuestId!.Value, room.GuestUsername!, 0, 0, 0, 0, false);

        return ToRoomState(room);
    }

    public void UpdatePlayerProgress(string roomCode, Guid playerId, PlayerProgress progress)
    {
        var key = $"{roomCode.ToUpperInvariant()}:{playerId}";
        _playerProgress[key] = progress;
    }

    public PlayerProgress? GetOpponentProgress(string roomCode, Guid playerId)
    {
        roomCode = roomCode.ToUpperInvariant();
        
        if (!_rooms.TryGetValue(roomCode, out var room))
            return null;

        var opponentId = room.HostId == playerId ? room.GuestId : room.HostId;
        if (opponentId is null)
            return null;

        var key = $"{roomCode}:{opponentId}";
        return _playerProgress.TryGetValue(key, out var progress) ? progress : null;
    }

    public RoomState? FinishGame(string roomCode)
    {
        roomCode = roomCode.ToUpperInvariant();
        
        if (!_rooms.TryGetValue(roomCode, out var room))
            return null;

        room.FinishGame();
        return ToRoomState(room);
    }

    public void RemoveRoom(string roomCode)
    {
        roomCode = roomCode.ToUpperInvariant();
        
        if (_rooms.TryRemove(roomCode, out var room))
        {
            if (room.HostConnectionId is not null)
                _connectionToRoom.TryRemove(room.HostConnectionId, out _);
            if (room.GuestConnectionId is not null)
                _connectionToRoom.TryRemove(room.GuestConnectionId, out _);
            
            _playerProgress.TryRemove($"{roomCode}:{room.HostId}", out _);
            if (room.GuestId.HasValue)
                _playerProgress.TryRemove($"{roomCode}:{room.GuestId}", out _);
        }
    }

    public bool IsHost(string roomCode, string connectionId)
    {
        roomCode = roomCode.ToUpperInvariant();
        return _rooms.TryGetValue(roomCode, out var room) && room.HostConnectionId == connectionId;
    }

    private string GenerateRoomCode()
    {
        var random = Random.Shared;
        string code;
        do
        {
            code = new string(Enumerable.Range(0, 6)
                .Select(_ => RoomCodeChars[random.Next(RoomCodeChars.Length)])
                .ToArray());
        } while (_rooms.ContainsKey(code));

        return code;
    }

    private static RoomState ToRoomState(GameRoom room) => new(
        room.Id,
        room.RoomCode,
        new PlayerInfo(room.HostId, room.HostUsername, room.HostConnectionId ?? ""),
        room.GuestId.HasValue 
            ? new PlayerInfo(room.GuestId.Value, room.GuestUsername ?? "", room.GuestConnectionId ?? "")
            : null,
        room.Status,
        room.GetWords().Length > 0 ? room.GetWords() : null,
        room.CreatedAt,
        room.StartedAt
    );
}
