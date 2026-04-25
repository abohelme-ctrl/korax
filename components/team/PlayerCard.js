'use client'

import { getRarityConfig } from '@/lib/utils'

export default function PlayerCard({ player, compact = false, onPress, selected = false }) {
  const rarity = getRarityConfig(player.rarity)

  if (compact) {
    return (
      <button
        onClick={() => onPress?.(player)}
        className={`
          player-card ${player.rarity.toLowerCase()} w-full text-right
          bg-gradient-to-b ${rarity.gradient} ${rarity.border} ${rarity.glow}
          ${selected ? 'ring-2 ring-primary' : ''}
          transition-all duration-200
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{player.team.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-text truncate">{player.name}</p>
            <p className="text-[10px] text-muted">{player.position}</p>
          </div>
          <span className="text-sm font-black text-text">{player.power}</span>
        </div>
        <div className={`mt-1 text-[9px] font-bold ${
          player.rarity === 'LEGENDARY' ? 'text-gold' :
          player.rarity === 'RARE'      ? 'text-primary' : 'text-muted'
        }`}>
          {rarity.label}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onPress?.(player)}
      className={`
        player-card ${player.rarity.toLowerCase()} w-full
        bg-gradient-to-b ${rarity.gradient} ${rarity.border} ${rarity.glow}
        ${selected ? 'ring-2 ring-primary' : ''}
        transition-all duration-200 shadow-lg
      `}
    >
      {/* Rarity badge */}
      <div className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
        player.rarity === 'LEGENDARY' ? 'bg-gold/20 text-gold' :
        player.rarity === 'RARE'      ? 'bg-primary/20 text-primary' :
        'bg-white/10 text-muted'
      }`}>
        {rarity.label}
      </div>

      {/* Flag + number */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{player.team.flag}</span>
        <span className="text-2xl font-black text-white/20">#{player.number}</span>
      </div>

      {/* Power */}
      <div className="text-3xl font-black text-text mb-1">{player.power}</div>

      {/* Name */}
      <p className="text-sm font-bold text-text leading-tight mb-0.5 text-right">{player.name}</p>
      <p className="text-xs text-muted text-right">{player.position}</p>

      {/* Stats */}
      <div className="flex justify-between mt-3 pt-2 border-t border-white/10">
        <StatMini label="أهداف" value={player.wcGoals} />
        <StatMini label="مباريات" value={player.stats.matches} />
        <StatMini label="مساعدات" value={player.stats.assists} />
      </div>

      {/* Injury badge */}
      {player.injured && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-live font-bold">
          <span>🤕</span> مصاب
        </div>
      )}
    </button>
  )
}

function StatMini({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-sm font-black text-text">{value}</span>
      <span className="text-[9px] text-muted">{label}</span>
    </div>
  )
}
