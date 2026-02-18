using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TyperacerAPI.Entities;
using TyperacerAPI.Services;

namespace TyperacerAPI.Hubs;

public record CreateRoomResponse(string RoomCode, PlayerDto Host);
public record JoinRoomResponse(string RoomCode, PlayerDto Host, PlayerDto Guest, string[] Words);
public record PlayerDto(Guid Id, string Username);
public record GameStartingResponse(int CountdownSeconds);
public record GameStartedResponse(string[] Words, long StartTime);
public record ProgressUpdateDto(int CurrentWordIndex, int CurrentCharIndex, double Wpm, int Errors, bool IsFinished);
public record OpponentProgressResponse(Guid PlayerId, string Username, int CurrentWordIndex, int CurrentCharIndex, double Wpm, int Errors, bool IsFinished);
public record PlayerFinishedDto(int WordsTyped, int TotalWords, int Errors, double Wpm, double Accuracy, long ElapsedMs);
public record GameEndedResponse(PlayerResultDto Winner, PlayerResultDto Loser);
public record PlayerResultDto(Guid Id, string Username, int WordsTyped, double Wpm, double Accuracy, long ElapsedMs, bool IsWinner);

public class GameHub : Hub
{
    private readonly IRoomService _roomService;
    private readonly IWordService _wordService;
    private readonly ILogger<GameHub> _logger;

    public GameHub(IRoomService roomService, IWordService wordService, ILogger<GameHub> logger)
    {
        _roomService = roomService;
        _wordService = wordService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        
        var room = _roomService.LeaveRoom(Context.ConnectionId);
        if (room is not null)
        {
            if (room.Status == RoomStatus.Abandoned)
            {
                if (room.Guest is not null)
                {
                    await Clients.Client(room.Guest.ConnectionId).SendAsync("RoomClosed", "Host left the room");
                }
            }
            else if (room.Guest is null)
            {
                await Clients.Client(room.Host.ConnectionId).SendAsync("PlayerLeft");
            }
        }
        
        await base.OnDisconnectedAsync(exception);
    }

    public async Task<CreateRoomResponse> CreateRoom()
    {
        var userId = GetUserId();
        var username = GetUsername();

        var room = _roomService.CreateRoom(userId, username, Context.ConnectionId);
        
        await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
        
        _logger.LogInformation("Room created: {RoomCode} by {Username}", room.RoomCode, username);
        
        return new CreateRoomResponse(
            room.RoomCode,
            new PlayerDto(room.Host.Id, room.Host.Username)
        );
    }

    public async Task<JoinRoomResponse?> JoinRoom(string roomCode)
    {
        var userId = GetUserId();
        var username = GetUsername();

        var room = _roomService.JoinRoom(roomCode, userId, username, Context.ConnectionId);
        
        if (room is null)
        {
            await Clients.Caller.SendAsync("JoinFailed", "Room not found or not available");
            return null;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomCode);
        
        await Clients.Client(room.Host.ConnectionId).SendAsync("PlayerJoined", new PlayerDto(userId, username));
        
        _logger.LogInformation("Player {Username} joined room {RoomCode}", username, room.RoomCode);
        
        return new JoinRoomResponse(
            room.RoomCode,
            new PlayerDto(room.Host.Id, room.Host.Username),
            new PlayerDto(room.Guest!.Id, room.Guest.Username),
            []
        );
    }

    public async Task LeaveRoom()
    {
        var room = _roomService.LeaveRoom(Context.ConnectionId);
        
        if (room is not null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomCode);
            
            if (room.Status == RoomStatus.Abandoned)
            {
                if (room.Guest is not null)
                {
                    await Clients.Client(room.Guest.ConnectionId).SendAsync("RoomClosed", "Host left the room");
                }
            }
            else
            {
                await Clients.Client(room.Host.ConnectionId).SendAsync("PlayerLeft");
            }
        }
    }

    public async Task StartGame()
    {
        var room = _roomService.GetRoomByConnectionId(Context.ConnectionId);
        
        if (room is null)
        {
            await Clients.Caller.SendAsync("Error", "Room not found");
            return;
        }

        if (!_roomService.IsHost(room.RoomCode, Context.ConnectionId))
        {
            await Clients.Caller.SendAsync("Error", "Only the host can start the game");
            return;
        }

        if (room.Guest is null)
        {
            await Clients.Caller.SendAsync("Error", "Waiting for opponent to join");
            return;
        }

        await Clients.Group(room.RoomCode).SendAsync("GameStarting", new GameStartingResponse(3));
        
        await Task.Delay(3000);
        
        var words = _wordService.GenerateWords(50);
        var updatedRoom = _roomService.StartGame(room.RoomCode, words);
        
        if (updatedRoom is null)
        {
            await Clients.Group(room.RoomCode).SendAsync("Error", "Failed to start game");
            return;
        }

        var startTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        await Clients.Group(room.RoomCode).SendAsync("GameStarted", new GameStartedResponse(words, startTime));
        
        _logger.LogInformation("Game started in room {RoomCode}", room.RoomCode);
    }

    public async Task UpdateProgress(ProgressUpdateDto progress)
    {
        var userId = GetUserId();
        var username = GetUsername();
        var room = _roomService.GetRoomByConnectionId(Context.ConnectionId);
        
        if (room is null || room.Status != RoomStatus.Playing)
            return;

        var playerProgress = new PlayerProgress(
            userId,
            username,
            progress.CurrentWordIndex,
            progress.CurrentCharIndex,
            progress.Wpm,
            progress.Errors,
            progress.IsFinished
        );
        
        _roomService.UpdatePlayerProgress(room.RoomCode, userId, playerProgress);
        
        var opponentConnectionId = room.Host.Id == userId 
            ? room.Guest?.ConnectionId 
            : room.Host.ConnectionId;
        
        if (opponentConnectionId is not null)
        {
            await Clients.Client(opponentConnectionId).SendAsync("OpponentProgress", 
                new OpponentProgressResponse(
                    userId,
                    username,
                    progress.CurrentWordIndex,
                    progress.CurrentCharIndex,
                    progress.Wpm,
                    progress.Errors,
                    progress.IsFinished
                ));
        }
    }

    public async Task PlayerFinished(PlayerFinishedDto stats)
    {
        var userId = GetUserId();
        var username = GetUsername();
        var room = _roomService.GetRoomByConnectionId(Context.ConnectionId);
        
        if (room is null || room.Status != RoomStatus.Playing)
            return;

        var playerProgress = new PlayerProgress(
            userId,
            username,
            stats.WordsTyped,
            0,
            stats.Wpm,
            stats.Errors,
            true
        );
        
        _roomService.UpdatePlayerProgress(room.RoomCode, userId, playerProgress);

        var opponentProgress = _roomService.GetOpponentProgress(room.RoomCode, userId);
        
        var opponentConnectionId = room.Host.Id == userId 
            ? room.Guest?.ConnectionId 
            : room.Host.ConnectionId;
        
        if (opponentConnectionId is not null)
        {
            await Clients.Client(opponentConnectionId).SendAsync("OpponentFinished", 
                new PlayerResultDto(userId, username, stats.WordsTyped, stats.Wpm, stats.Accuracy, stats.ElapsedMs, false));
        }

        if (opponentProgress is { IsFinished: true })
        {
            var updatedRoom = _roomService.FinishGame(room.RoomCode);
            
            var myResult = new PlayerResultDto(
                userId, 
                username, 
                stats.WordsTyped, 
                stats.Wpm, 
                stats.Accuracy, 
                stats.ElapsedMs, 
                stats.ElapsedMs <= (opponentProgress.Wpm > 0 ? stats.ElapsedMs : long.MaxValue)
            );
            
            var opponentResult = new PlayerResultDto(
                opponentProgress.PlayerId,
                opponentProgress.Username,
                opponentProgress.CurrentWordIndex,
                opponentProgress.Wpm,
                100 - (opponentProgress.Errors * 2.0),
                0,
                opponentProgress.Wpm >= stats.Wpm
            );

            PlayerResultDto winner, loser;
            if (stats.Wpm >= opponentProgress.Wpm)
            {
                winner = myResult with { IsWinner = true };
                loser = opponentResult with { IsWinner = false };
            }
            else
            {
                winner = opponentResult with { IsWinner = true };
                loser = myResult with { IsWinner = false };
            }

            await Clients.Group(room.RoomCode).SendAsync("GameEnded", new GameEndedResponse(winner, loser));
            
            _logger.LogInformation("Game ended in room {RoomCode}. Winner: {Winner}", room.RoomCode, winner.Username);
            
            _roomService.RemoveRoom(room.RoomCode);
        }
    }

    private static readonly Dictionary<string, Guid> _connectionUserIds = new();

    private Guid GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? Context.User?.FindFirst("sub")?.Value;
        
        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
            return userId;

        if (!_connectionUserIds.TryGetValue(Context.ConnectionId, out var guestId))
        {
            guestId = Guid.NewGuid();
            _connectionUserIds[Context.ConnectionId] = guestId;
        }
        return guestId;
    }

    private string GetUsername()
    {
        var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value 
            ?? Context.User?.FindFirst("name")?.Value;
        
        if (!string.IsNullOrEmpty(username))
            return username;

        var guestNumber = Math.Abs(GetUserId().GetHashCode() % 10000);
        return $"Guest_{guestNumber}";
    }
}
