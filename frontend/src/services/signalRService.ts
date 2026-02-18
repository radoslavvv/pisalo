import * as signalR from "@microsoft/signalr";
import type {
	Player,
	PlayerProgress,
	PlayerResult,
	GameEndedResult,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:5042";

export interface CreateRoomResponse {
	roomCode: string;
	host: Player;
}

export interface JoinRoomResponse {
	roomCode: string;
	host: Player;
	guest: Player;
	words: string[];
}

export interface GameStartingResponse {
	countdownSeconds: number;
}

export interface GameStartedResponse {
	words: string[];
	startTime: number;
}

export interface ProgressUpdate {
	currentWordIndex: number;
	currentCharIndex: number;
	wpm: number;
	errors: number;
	isFinished: boolean;
}

export interface PlayerFinishedStats {
	wordsTyped: number;
	totalWords: number;
	errors: number;
	wpm: number;
	accuracy: number;
	elapsedMs: number;
}

type ConnectionStatusCallback = (
	status: "disconnected" | "connecting" | "connected" | "reconnecting",
) => void;
type ErrorCallback = (error: string) => void;
type RoomCreatedCallback = (response: CreateRoomResponse) => void;
type PlayerJoinedCallback = (player: Player) => void;
type JoinedRoomCallback = (response: JoinRoomResponse) => void;
type JoinFailedCallback = (reason: string) => void;
type PlayerLeftCallback = () => void;
type RoomClosedCallback = (reason: string) => void;
type GameStartingCallback = (response: GameStartingResponse) => void;
type GameStartedCallback = (response: GameStartedResponse) => void;
type OpponentProgressCallback = (progress: PlayerProgress) => void;
type OpponentFinishedCallback = (result: PlayerResult) => void;
type GameEndedCallback = (result: GameEndedResult) => void;

class SignalRService {
	private connection: signalR.HubConnection | null = null;
	private callbacks: Map<string, Set<(...args: unknown[]) => void>> =
		new Map();

	async connect(token: string): Promise<void> {
		if (this.connection?.state === signalR.HubConnectionState.Connected) {
			return;
		}

		this.emit("connectionStatus", "connecting");

		this.connection = new signalR.HubConnectionBuilder()
			.withUrl(
				`${API_URL}/hubs/game?access_token=${encodeURIComponent(token)}`,
			)
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: (retryContext) => {
					if (retryContext.elapsedMilliseconds < 60000) {
						return Math.min(
							1000 * Math.pow(2, retryContext.previousRetryCount),
							30000,
						);
					}
					return null;
				},
			})
			.configureLogging(signalR.LogLevel.Information)
			.build();

		this.setupEventHandlers();

		try {
			await this.connection.start();
			this.emit("connectionStatus", "connected");
		} catch (error) {
			this.emit("connectionStatus", "disconnected");
			this.emit(
				"error",
				error instanceof Error ? error.message : "Failed to connect",
			);
			throw error;
		}
	}

	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.stop();
			this.connection = null;
			this.emit("connectionStatus", "disconnected");
		}
	}

	private setupEventHandlers(): void {
		if (!this.connection) return;

		this.connection.onreconnecting(() => {
			this.emit("connectionStatus", "reconnecting");
		});

		this.connection.onreconnected(() => {
			this.emit("connectionStatus", "connected");
		});

		this.connection.onclose(() => {
			this.emit("connectionStatus", "disconnected");
		});

		this.connection.on("Error", (message: string) => {
			this.emit("error", message);
		});

		this.connection.on("PlayerJoined", (player: Player) => {
			this.emit("playerJoined", player);
		});

		this.connection.on("JoinFailed", (reason: string) => {
			this.emit("joinFailed", reason);
		});

		this.connection.on("PlayerLeft", () => {
			this.emit("playerLeft");
		});

		this.connection.on("RoomClosed", (reason: string) => {
			this.emit("roomClosed", reason);
		});

		this.connection.on("GameStarting", (response: GameStartingResponse) => {
			this.emit("gameStarting", response);
		});

		this.connection.on("GameStarted", (response: GameStartedResponse) => {
			this.emit("gameStarted", response);
		});

		this.connection.on("OpponentProgress", (progress: PlayerProgress) => {
			this.emit("opponentProgress", progress);
		});

		this.connection.on("OpponentFinished", (result: PlayerResult) => {
			this.emit("opponentFinished", result);
		});

		this.connection.on("GameEnded", (result: GameEndedResult) => {
			this.emit("gameEnded", result);
		});
	}

	async createRoom(): Promise<CreateRoomResponse> {
		if (!this.connection) {
			throw new Error("Not connected");
		}
		return await this.connection.invoke<CreateRoomResponse>("CreateRoom");
	}

	async joinRoom(roomCode: string): Promise<JoinRoomResponse | null> {
		if (!this.connection) {
			throw new Error("Not connected");
		}
		return await this.connection.invoke<JoinRoomResponse | null>(
			"JoinRoom",
			roomCode,
		);
	}

	async leaveRoom(): Promise<void> {
		if (!this.connection) return;
		await this.connection.invoke("LeaveRoom");
	}

	async startGame(): Promise<void> {
		if (!this.connection) {
			throw new Error("Not connected");
		}
		await this.connection.invoke("StartGame");
	}

	async updateProgress(progress: ProgressUpdate): Promise<void> {
		if (!this.connection) return;
		await this.connection.invoke("UpdateProgress", progress);
	}

	async playerFinished(stats: PlayerFinishedStats): Promise<void> {
		if (!this.connection) return;
		await this.connection.invoke("PlayerFinished", stats);
	}

	on(event: "connectionStatus", callback: ConnectionStatusCallback): void;
	on(event: "error", callback: ErrorCallback): void;
	on(event: "playerJoined", callback: PlayerJoinedCallback): void;
	on(event: "joinFailed", callback: JoinFailedCallback): void;
	on(event: "playerLeft", callback: PlayerLeftCallback): void;
	on(event: "roomClosed", callback: RoomClosedCallback): void;
	on(event: "gameStarting", callback: GameStartingCallback): void;
	on(event: "gameStarted", callback: GameStartedCallback): void;
	on(event: "opponentProgress", callback: OpponentProgressCallback): void;
	on(event: "opponentFinished", callback: OpponentFinishedCallback): void;
	on(event: "gameEnded", callback: GameEndedCallback): void;
	on(event: string, callback: (...args: unknown[]) => void): void {
		if (!this.callbacks.has(event)) {
			this.callbacks.set(event, new Set());
		}
		this.callbacks.get(event)!.add(callback);
	}

	off(event: string, callback: (...args: unknown[]) => void): void {
		this.callbacks.get(event)?.delete(callback);
	}

	private emit(event: string, ...args: unknown[]): void {
		this.callbacks.get(event)?.forEach((callback) => callback(...args));
	}

	get isConnected(): boolean {
		return this.connection?.state === signalR.HubConnectionState.Connected;
	}
}

export const signalRService = new SignalRService();
