export default function MatchStats({ stats, homeTeam, awayTeam }) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted">
        <span className="text-3xl">📊</span>
        <p className="text-sm">الإحصائيات ستظهر بعد بدء المباراة</p>
      </div>
    )
  }

  // ── الإحصائيات الرئيسية ──────────────────────────────────────────────────────
  const attackRows = [
    { icon: '👟', label: 'التسديدات الكلية',  h: stats.shots?.[0],         a: stats.shots?.[1]         },
    { icon: '🎯', label: 'على المرمى',         h: stats.shotsOnTarget?.[0], a: stats.shotsOnTarget?.[1] },
    { icon: '🚫', label: 'تسديدات محجوبة',     h: stats.blockedShots?.[0],  a: stats.blockedShots?.[1]  },
    { icon: '🏁', label: 'الركنيات',           h: stats.corners?.[0],       a: stats.corners?.[1]       },
    { icon: '⚡', label: 'المراوغات الناجحة',  h: stats.dribbles?.[0],      a: stats.dribbles?.[1]      },
  ].filter(r => r.h != null)

  const passRows = [
    { icon: '⚙️', label: 'إجمالي التمريرات',  h: stats.passesTotal?.[0],    a: stats.passesTotal?.[1]    },
    { icon: '✅', label: 'تمريرات دقيقة',      h: stats.passesAccuracy?.[0], a: stats.passesAccuracy?.[1] },
  ].filter(r => r.h != null)

  const defenceRows = [
    { icon: '⚠️', label: 'التسللات',      h: stats.offsides?.[0],    a: stats.offsides?.[1]    },
    { icon: '🔰', label: 'الأخطاء',       h: stats.fouls?.[0],       a: stats.fouls?.[1]       },
    { icon: '🟨', label: 'البطاقات الصفراء', h: stats.yellowCards?.[0], a: stats.yellowCards?.[1] },
    { icon: '🟥', label: 'البطاقات الحمراء', h: stats.redCards?.[0],   a: stats.redCards?.[1]   },
    { icon: '🧤', label: 'تصدي الحارس',   h: stats.saves?.[0],       a: stats.saves?.[1]       },
  ].filter(r => r.h != null && (Number(r.h) + Number(r.a)) > 0)

  return (
    <div className="pb-4">

      {/* ── الاستحواذ ── */}
      <PossessionBar
        home={stats.possession?.[0] ?? 50}
        away={stats.possession?.[1] ?? 50}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />

      {/* ── هجوم ── */}
      {attackRows.length > 0 && (
        <Section title="الهجوم" icon="⚔️">
          {attackRows.map(r => <StatRow key={r.label} row={r} />)}
        </Section>
      )}

      {/* ── تمريرات ── */}
      {passRows.length > 0 && (
        <Section title="التمريرات" icon="⚙️">
          {passRows.map(r => <StatRow key={r.label} row={r} />)}
        </Section>
      )}

      {/* ── دفاع وانضباط ── */}
      {defenceRows.length > 0 && (
        <Section title="الدفاع والانضباط" icon="🛡️">
          {defenceRows.map(r => <StatRow key={r.label} row={r} />)}
        </Section>
      )}
    </div>
  )
}

// ─── Possession Bar ─────────────────────────────────────────────────────────────

function PossessionBar({ home, away, homeTeam, awayTeam }) {
  return (
    <div className="mx-4 my-4 card p-4">
      <p className="text-xs text-muted text-center mb-3 font-bold">الاستحواذ</p>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{homeTeam?.flag}</span>
          <span className="text-lg font-black text-primary">{home}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black text-live">{away}%</span>
          <span className="text-xl">{awayTeam?.flag}</span>
        </div>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        <div className="bg-primary rounded-full transition-all duration-700" style={{ width: `${home}%` }} />
        <div className="bg-live rounded-full flex-1 transition-all duration-700" />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted">{homeTeam?.name}</span>
        <span className="text-[10px] text-muted">{awayTeam?.name}</span>
      </div>
    </div>
  )
}

// ─── Section ────────────────────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div className="mx-4 mb-3">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-black text-muted uppercase tracking-wide">{title}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="card overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  )
}

// ─── Stat Row ───────────────────────────────────────────────────────────────────

function StatRow({ row }) {
  const h     = Number(row.h) || 0
  const a     = Number(row.a) || 0
  const total = h + a
  const homePct = total > 0 ? (h / total) * 100 : 50

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-black text-text w-10 text-left">{row.h ?? '—'}</span>
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <span className="text-sm">{row.icon}</span>
          <span className="text-xs font-medium text-muted">{row.label}</span>
        </div>
        <span className="text-sm font-black text-text w-10 text-right">{row.a ?? '—'}</span>
      </div>

      {/* شريط مقارنة */}
      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-border">
        <div className="bg-primary rounded-full transition-all duration-500" style={{ width: `${homePct}%` }} />
        <div className="bg-live rounded-full flex-1" />
      </div>
    </div>
  )
}
