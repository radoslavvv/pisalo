import { useEffect, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import { useGameStats } from "../../hooks/useGameStats";
import { useTimer } from "../../hooks/useTimer";

export default function GameStats() {
	const status = useGameStore((state) => state.status);
	const mode = useGameStore((state) => state.mode);
	const wordLimit = useGameStore((state) => state.wordLimit);

	const stats = useGameStats();
	const { elapsed, remaining, formatTime, isTimedMode } = useTimer();

	const [displayWpm, setDisplayWpm] = useState(0);

	useEffect(() => {
		if (status !== "playing") {
			if (status === "finished") {
				setDisplayWpm(stats.wpm);
			}
			return;
		}

		const interval = setInterval(() => {
			setDisplayWpm(stats.wpm);
		}, 500);

		return () => clearInterval(interval);
	}, [status, stats.wpm]);

	const StatBox = ({
		label,
		value,
		highlight = false,
		large = false,
	}: {
		label: string;
		value: string | number;
		highlight?: boolean;
		large?: boolean;
	}) => (
		<div
			className={`rounded-lg border ${
				highlight
					? "border-[var(--color-amber-500)]/30 bg-[var(--color-amber-500)]/10"
					: "border-[var(--color-charcoal-600)] bg-[var(--color-charcoal-800)]/50"
			} px-4 py-3 text-center`}
		>
			<div
				className={`font-[var(--font-mono)] font-bold ${
					large ? "text-3xl" : "text-2xl"
				} ${highlight ? "text-[var(--color-amber-400)]" : "text-white"}`}
			>
				{value}
			</div>
			<div className="mt-1 text-xs uppercase tracking-wider text-[var(--color-gray-500)]">
				{label}
			</div>
		</div>
	);

	const showTimeCard = mode !== "zen" && mode !== "instant-death";

	return (
		<div
			className={`grid gap-3 ${showTimeCard ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}
		>
			<StatBox label="WPM" value={displayWpm} highlight large />

			<StatBox label="Accuracy" value={`${stats.accuracy}%`} />

			{showTimeCard &&
				(isTimedMode ? (
					<StatBox
						label="Time Left"
						value={
							remaining !== null ? formatTime(remaining) : "--"
						}
						highlight={remaining !== null && remaining <= 10}
					/>
				) : (
					<StatBox label="Time" value={formatTime(elapsed)} />
				))}

			{mode === "word-count" && wordLimit ? (
				<StatBox
					label="Progress"
					value={`${stats.wordsTyped}/${wordLimit}`}
				/>
			) : mode === "instant-death" ? (
				<StatBox label="Words" value={stats.wordsTyped} />
			) : (
				<StatBox label="Errors" value={stats.errors} />
			)}
		</div>
	);
}
