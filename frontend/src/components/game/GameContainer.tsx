import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "../../store/gameStore";
import { useTypingEngine } from "../../hooks/useTypingEngine";
import WordDisplay from "./WordDisplay";
import TypingInput, { type TypingInputHandle } from "./TypingInput";
import GameStats from "./GameStats";
import CountdownOverlay from "./CountdownOverlay";
import GameResults from "./GameResults";
import type { GameMode } from "../../types";

interface GameContainerProps {
	mode: GameMode;
	option?: number;
}

export default function GameContainer({ mode, option }: GameContainerProps) {
	const inputRef = useRef<TypingInputHandle>(null);

	const status = useGameStore((state) => state.status);
	const initGame = useGameStore((state) => state.initGame);
	const startCountdown = useGameStore((state) => state.startCountdown);
	const startPlaying = useGameStore((state) => state.startPlaying);
	const resetGame = useGameStore((state) => state.resetGame);

	useTypingEngine();

	useEffect(() => {
		initGame(mode, option);
	}, [mode, option, initGame]);

	const handleStart = useCallback(() => {
		startCountdown();
	}, [startCountdown]);

	const handleCountdownComplete = useCallback(() => {
		startPlaying();
		inputRef.current?.focus();
	}, [startPlaying]);

	const handleRestart = useCallback(() => {
		resetGame();
		setTimeout(() => {
			startCountdown();
		}, 100);
	}, [resetGame, startCountdown]);

	const handleContainerClick = useCallback(() => {
		if (status === "playing") {
			inputRef.current?.focus();
		}
	}, [status]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (status === "idle" && e.key.length === 1) {
				handleStart();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [status, handleStart]);

	if (status === "finished") {
		return <GameResults onRestart={handleRestart} />;
	}

	return (
		<div className="relative space-y-6" onClick={handleContainerClick}>
			<GameStats />

			<div className="relative">
				<WordDisplay />

				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-charcoal-800)] to-transparent rounded-xl" />
				{status === "countdown" && (
					<CountdownOverlay onComplete={handleCountdownComplete} />
				)}
			</div>

			<TypingInput ref={inputRef} />

			{status === "idle" && (
				<div className="flex justify-center">
					<button
						onClick={handleStart}
						className="rounded-xl bg-[var(--color-amber-500)] px-8 py-3 font-semibold text-[var(--color-charcoal-950)] transition-all hover:bg-[var(--color-amber-400)] hover:shadow-lg hover:shadow-[var(--color-amber-500)]/20"
					>
						Start Typing
					</button>
				</div>
			)}
		</div>
	);
}
