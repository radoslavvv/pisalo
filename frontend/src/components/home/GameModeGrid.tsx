import { gameModes } from '../../mocks/gameModes'
import GameModeCard from './GameModeCard'

export default function GameModeGrid() {
  return (
    <section id="game-modes" className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="animate-fade-in-up mb-3 font-[var(--font-display)] text-3xl font-bold text-white opacity-0 sm:text-4xl">
            Choose Your Challenge
          </h2>
          <p className="animate-fade-in-up stagger-1 text-[var(--color-gray-400)] opacity-0">
            Five distinct modes to test every aspect of your typing ability
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gameModes.map((mode, index) => (
            <GameModeCard key={mode.id} mode={mode} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
