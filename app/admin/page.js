'use client'

import { useState } from 'react'

const AWARDS = [
  { id: 'champion',   label: '🏆 بطل كأس العالم',   pts: 50, type: 'team'   },
  { id: 'finalist',   label: '🥈 الوصيف',            pts: 25, type: 'team'   },
  { id: 'surprise',   label: '⚡ منتخب المفاجأة',    pts: 15, type: 'team'   },
  { id: 'topScorer',  label: '👟 هداف البطولة',       pts: 30, type: 'player' },
  { id: 'bestPlayer', label: '⭐ أفضل لاعب',          pts: 20, type: 'player' },
]

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function AdminPage() {
  const [secret, setSecret]   = useState('')
  const [authed, setAuthed]   = useState(false)
  const [tab, setTab]         = useState('match')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)

  // ─── Match fields ───────────────────────────────────────────────────────────
  const [matchId, setMatchId]       = useState('')
  const [actualHome, setActualHome] = useState('')
  const [actualAway, setActualAway] = useState('')

  // ─── Award fields ───────────────────────────────────────────────────────────
  const [awardId, setAwardId]         = useState('champion')
  const [actualValue, setActualValue] = useState('')

  // ─── Group fields ───────────────────────────────────────────────────────────
  const [group, setGroup]       = useState('A')
  const [slot, setSlot]         = useState('1st')
  const [actualTeam, setActualTeam] = useState('')

  async function call(body) {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/update-result', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ secret, ...body }),
      })
      const data = await res.json()
      if (res.status === 401) {
        setAuthed(false)
        setResult({ error: 'كلمة المرور خاطئة' })
      } else {
        setResult(data)
      }
    } catch (e) {
      setResult({ error: e.message })
    } finally {
      setLoading(false)
    }
  }

  // ─── شاشة تسجيل الدخول ─────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="font-black text-xl text-text mb-6">لوحة الإدارة</h1>
          <input
            type="password"
            placeholder="كلمة مرور الإدارة"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setAuthed(true)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-center text-lg tracking-widest outline-none focus:border-primary mb-4"
          />
          <button
            onClick={() => setAuthed(true)}
            className="w-full py-3 rounded-2xl bg-primary text-white font-black"
          >
            دخول
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-xl text-text">⚙️ لوحة الإدارة</h1>
        <button onClick={() => setAuthed(false)} className="text-xs text-muted border border-border px-3 py-1.5 rounded-xl">
          خروج
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'match', label: '⚽ مباريات' },
          { id: 'award', label: '🏆 جوائز'   },
          { id: 'group', label: '📊 مجموعات' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResult(null) }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === t.id ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ المباريات ══ */}
      {tab === 'match' && (
        <div className="card p-5 space-y-4">
          <p className="font-black text-text">إدخال نتيجة مباراة</p>
          <p className="text-xs text-muted">
            النقاط: نتيجة دقيقة = <span className="text-primary font-bold">3 نقاط</span> |
            فائز صح = <span className="text-gold font-bold">1 نقطة</span>
          </p>

          <div>
            <label className="text-xs text-muted block mb-1">معرّف المباراة (matchId)</label>
            <input
              value={matchId}
              onChange={e => setMatchId(e.target.value)}
              placeholder="مثال: 12345"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">أهداف الفريق الأول</label>
              <input
                type="number"
                min="0"
                value={actualHome}
                onChange={e => setActualHome(e.target.value)}
                placeholder="0"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary text-center text-xl font-black"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">أهداف الفريق الثاني</label>
              <input
                type="number"
                min="0"
                value={actualAway}
                onChange={e => setActualAway(e.target.value)}
                placeholder="0"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary text-center text-xl font-black"
              />
            </div>
          </div>

          <button
            onClick={() => call({ type: 'match', matchId, actualHome, actualAway })}
            disabled={loading || !matchId || actualHome === '' || actualAway === ''}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? '⏳ جاري المعالجة...' : '✅ احسب النقاط'}
          </button>
        </div>
      )}

      {/* ══ الجوائز ══ */}
      {tab === 'award' && (
        <div className="card p-5 space-y-4">
          <p className="font-black text-text">إدخال نتيجة جائزة</p>

          <div>
            <label className="text-xs text-muted block mb-1">الجائزة</label>
            <select
              value={awardId}
              onChange={e => { setAwardId(e.target.value); setActualValue('') }}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary text-sm"
            >
              {AWARDS.map(a => (
                <option key={a.id} value={a.id}>{a.label} ({a.pts} نقطة)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">
              {AWARDS.find(a => a.id === awardId)?.type === 'team' ? 'اسم المنتخب الفائز' : 'اسم اللاعب'}
            </label>
            <input
              value={actualValue}
              onChange={e => setActualValue(e.target.value)}
              placeholder={AWARDS.find(a => a.id === awardId)?.type === 'team' ? 'مثال: البرازيل' : 'مثال: محمد صلاح'}
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary text-sm"
            />
          </div>

          <button
            onClick={() => call({ type: 'award', awardId, actualValue })}
            disabled={loading || !actualValue.trim()}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? '⏳ جاري المعالجة...' : '✅ احسب النقاط'}
          </button>
        </div>
      )}

      {/* ══ المجموعات ══ */}
      {tab === 'group' && (
        <div className="card p-5 space-y-4">
          <p className="font-black text-text">إدخال ترتيب مجموعة</p>
          <p className="text-xs text-muted">
            المركز الأول = <span className="text-primary font-bold">10 نقاط</span> |
            المركز الثاني = <span className="text-gold font-bold">5 نقاط</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">المجموعة</label>
              <select
                value={group}
                onChange={e => setGroup(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary"
              >
                {GROUPS.map(g => <option key={g} value={g}>المجموعة {g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">المركز</label>
              <select
                value={slot}
                onChange={e => setSlot(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary"
              >
                <option value="1st">🥇 الأول (10 نقاط)</option>
                <option value="2nd">🥈 الثاني (5 نقاط)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">اسم المنتخب</label>
            <input
              value={actualTeam}
              onChange={e => setActualTeam(e.target.value)}
              placeholder="مثال: البرازيل"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text outline-none focus:border-primary text-sm"
            />
          </div>

          <button
            onClick={() => call({ type: 'group', group, slot, actualTeam })}
            disabled={loading || !actualTeam.trim()}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? '⏳ جاري المعالجة...' : '✅ احسب النقاط'}
          </button>
        </div>
      )}

      {/* ══ النتيجة ══ */}
      {result && (
        <div className={`mt-4 card p-4 border-2 ${result.error ? 'border-live/40 bg-live/5' : 'border-green-400/40 bg-green-400/5'}`}>
          {result.error ? (
            <p className="text-live font-bold text-sm">❌ {result.error}</p>
          ) : (
            <div className="space-y-2">
              <p className="font-black text-text">{result.message}</p>
              {result.exact !== undefined && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-black text-primary">{result.exact}</p>
                    <p className="text-[10px] text-muted">نتيجة دقيقة (+3)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-gold">{result.winner}</p>
                    <p className="text-[10px] text-muted">فائز صح (+1)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-muted">{result.wrong}</p>
                    <p className="text-[10px] text-muted">خطأ (0)</p>
                  </div>
                </div>
              )}
              {result.correct !== undefined && result.exact === undefined && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-black text-primary">{result.correct}</p>
                    <p className="text-[10px] text-muted">أصابوا ✅</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-muted">{result.wrong}</p>
                    <p className="text-[10px] text-muted">خطأ ❌</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
