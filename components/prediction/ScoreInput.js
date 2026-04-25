'use client'

export default function ScoreInput({ value, onChange, teamName, teamFlag, side }) {
  const inc = () => onChange(Math.min(value + 1, 20))
  const dec = () => onChange(Math.max(value - 1, 0))

  return (
    <div className={`flex flex-col items-center gap-3 ${side === 'away' ? 'items-center' : 'items-center'}`}>
      {/* Team */}
      <span className="text-5xl leading-none">{teamFlag}</span>
      <span className="text-base font-bold text-text text-center max-w-[100px] leading-tight">{teamName}</span>

      {/* Score control */}
      <div className="flex flex-col items-center gap-2 mt-1">
        {/* Plus */}
        <button
          onClick={inc}
          className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold active:scale-90 transition-transform hover:bg-primary/25"
        >
          +
        </button>

        {/* Score box */}
        <div className="score-box">
          {value}
        </div>

        {/* Minus */}
        <button
          onClick={dec}
          disabled={value === 0}
          className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-muted-light text-xl font-bold active:scale-90 transition-transform disabled:opacity-30 hover:bg-card-hover"
        >
          −
        </button>
      </div>
    </div>
  )
}
