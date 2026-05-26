'use client'

import { useState, useEffect } from 'react'

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

  // ─── Lock state ─────────────────────────────────────────────────────────────
  const [lockSettings, setLockSettings] = useState({ awardsLocked: false, lockedGroups: [] })
  const [lockLoading, setLockLoading]   = useState(false)
  const [lockResult,  setLockResult]    = useState(null)

  // ─── Auto-process state ──────────────────────────────────────────────────────
  const [cronLoading, setCronLoading] = useState(false)
  const [cronResult,  setCronResult]  = useState(null)

  // ─── Stats state ─────────────────────────────────────────────────────────────
  const [stats,        setStats]        = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    if (!authed) return
    fetch('/api/settings').then(r => r.json()).then(s => setLockSettings(s)).catch(() => {})
    // تحميل الإحصائيات عند الدخول
    loadStats()
  }, [authed])

  async function loadStats() {
    setStatsLoading(true)
    try {
      const res  = await fetch(`/api/admin/stats?secret=${encodeURIComponent(secret)}`, {
        headers: { 'x-admin-secret': secret },
      })
      const data = await res.json()
      if (data.ok) setStats(data)
    } catch {}
    finally { setStatsLoading(false) }
  }

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

  async function runCron() {
    setCronLoading(true)
    setCronResult(null)
    try {
      const res  = await fetch(`/api/cron/process-results?secret=${encodeURIComponent(secret)}`, { method: 'GET' })
      const data = await res.json()
      setCronResult(data)
    } catch (e) {
      setCronResult({ error: e.message })
    } finally {
      setCronLoading(false)
    }
  }

  async function sendLock(action, value) {
    setLockLoading(true)
    setLockResult(null)
    try {
      const res = await fetch('/api/admin/lock', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ secret, action, value }),
      })
      const data = await res.json()
      if (res.status === 401) { setAuthed(false); return }
      if (data.settings) setLockSettings(data.settings)
      setLockResult(data.ok ? '✅ تم التحديث' : `❌ ${data.error}`)
    } catch (e) {
      setLockResult(`❌ ${e.message}`)
    } finally {
      setLockLoading(false)
    }
  }

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
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { id: 'stats', label: '📈 إحصائيات' },
          { id: 'auto',  label: '🤖 تلقائي'   },
          { id: 'match', label: '⚽ مباريات'  },
          { id: 'award', label: '🏆 جوائز'    },
          { id: 'group', label: '📊 مجموعات'  },
          { id: 'lock',  label: '🔒 القفل'    },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResult(null); setLockResult(null); setCronResult(null) }}
            className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
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

      {/* ══ الإحصائيات ══ */}
      {tab === 'stats' && (
        <div className="space-y-4">

          {/* زر تحديث */}
          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="w-full py-3 rounded-xl bg-card border border-border text-sm font-bold text-muted active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {statsLoading
              ? <><span className="animate-spin inline-block">⚙️</span><span>جاري التحميل...</span></>
              : <><span>🔄</span><span>تحديث الإحصائيات</span></>
            }
          </button>

          {statsLoading && !stats && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {stats && (
            <>
              {/* ── المستخدمون ── */}
              <div className="card p-4 space-y-3">
                <p className="font-black text-text">👤 المستخدمون</p>

                {/* أرقام كبيرة */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary/10 rounded-xl p-3 text-center">
                    <p className="text-3xl font-black text-primary">{stats.users.total}</p>
                    <p className="text-[10px] text-muted mt-0.5">إجمالي المسجّلين</p>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-3 text-center">
                    <p className="text-3xl font-black text-green-400">{stats.users.newToday}</p>
                    <p className="text-[10px] text-muted mt-0.5">انضموا اليوم</p>
                  </div>
                </div>

                {/* تفاصيل */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔵</span>
                      <span className="text-sm text-text">تسجيل بـ Google</span>
                    </div>
                    <span className="font-black text-primary">{stats.users.google}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📧</span>
                      <span className="text-sm text-text">تسجيل بـ Email</span>
                    </div>
                    <span className="font-black text-text">{stats.users.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📅</span>
                      <span className="text-sm text-text">آخر 7 أيام</span>
                    </div>
                    <span className="font-black text-gold">{stats.users.newThisWeek}</span>
                  </div>
                </div>

                {/* شريط Google vs Email */}
                {stats.users.total > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-muted mb-1">
                      <span>Google {Math.round(stats.users.google / stats.users.total * 100)}%</span>
                      <span>Email {Math.round(stats.users.email / stats.users.total * 100)}%</span>
                    </div>
                    <div className="h-2 bg-card rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.round(stats.users.google / stats.users.total * 100)}%` }}
                      />
                      <div className="h-full bg-muted flex-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── التوقعات ── */}
              <div className="card p-4 space-y-3">
                <p className="font-black text-text">⚽ التوقعات</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-primary/10 rounded-xl p-3 text-center">
                    <p className="text-3xl font-black text-primary">{stats.predictions.total}</p>
                    <p className="text-[10px] text-muted mt-0.5">إجمالي التوقعات</p>
                  </div>
                  <div className="bg-gold/10 rounded-xl p-3 text-center">
                    <p className="text-3xl font-black text-gold">{stats.predictions.today}</p>
                    <p className="text-[10px] text-muted mt-0.5">توقعات اليوم</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-500/10 rounded-xl p-2 text-center">
                    <p className="text-lg font-black text-green-400">{stats.predictions.resolved}</p>
                    <p className="text-[9px] text-muted">محتسبة</p>
                  </div>
                  <div className="flex-1 bg-card rounded-xl p-2 text-center">
                    <p className="text-lg font-black text-muted">{stats.predictions.pending}</p>
                    <p className="text-[9px] text-muted">معلّقة</p>
                  </div>
                </div>
              </div>

              {/* ── المجموعات ── */}
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-black text-text">👥 المجموعات</p>
                  <div className="bg-primary/10 rounded-xl px-4 py-2">
                    <p className="text-xl font-black text-primary">{stats.groups.total}</p>
                  </div>
                </div>
              </div>

              {/* ── المسجّلون اليوم ── */}
              {stats.users.list?.length > 0 && (
                <div className="card p-4 space-y-2">
                  <p className="font-black text-text">🆕 انضموا اليوم</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {stats.users.list.map((u, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-text truncate">{u.name}</p>
                          <p className="text-[10px] text-muted truncate">{u.email}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          u.provider === 'google'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-card text-muted border border-border'
                        }`}>
                          {u.provider === 'google' ? '🔵 Google' : '📧 Email'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* وقت آخر تحديث */}
              <p className="text-center text-[10px] text-muted pb-2">
                آخر تحديث: {new Date(stats.timestamp).toLocaleTimeString('ar')}
              </p>
            </>
          )}
        </div>
      )}

      {/* ══ التلقائي ══ */}
      {tab === 'auto' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <p className="font-black text-text">🤖 معالجة النتائج تلقائياً</p>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted space-y-1.5">
              <p>⚽ <span className="text-text font-bold">مباريات:</span> نتائج اليوم وأمس (FT/AET/PEN)</p>
              <p>📊 <span className="text-text font-bold">مجموعات:</span> بعد اكتمال الجولات الثلاث لكل مجموعة</p>
              <p>🏆 <span className="text-text font-bold">جوائز:</span> بطل + وصيف (من النهائي) + هداف (من API)</p>
              <p className="text-gold">⚠️ أفضل لاعب ومنتخب المفاجأة: يحتاجان إدخالاً يدوياً</p>
            </div>

            <button
              onClick={runCron}
              disabled={cronLoading}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {cronLoading
                ? <><span className="animate-spin inline-block">⚙️</span><span>جاري المعالجة...</span></>
                : <><span>🔄</span><span>شغّل الآن</span></>
              }
            </button>
          </div>

          {/* نتيجة الكرون */}
          {cronResult && (
            <div className={`card p-4 border-2 ${cronResult.error ? 'border-live/40 bg-live/5' : 'border-green-400/40 bg-green-400/5'}`}>
              {cronResult.error ? (
                <p className="text-live font-bold text-sm">❌ {cronResult.error}</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-text">✅ اكتملت المعالجة</p>
                    <p className="text-[10px] text-muted">
                      {cronResult.timestamp ? new Date(cronResult.timestamp).toLocaleTimeString('ar') : ''}
                    </p>
                  </div>

                  {/* إجماليات */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-bg/60 rounded-xl p-2">
                      <p className="text-lg font-black text-primary">{cronResult.processedMatches ?? 0}</p>
                      <p className="text-[9px] text-muted">مباريات</p>
                    </div>
                    <div className="text-center bg-bg/60 rounded-xl p-2">
                      <p className="text-lg font-black text-gold">{cronResult.processedGroups ?? 0}</p>
                      <p className="text-[9px] text-muted">مجموعات</p>
                    </div>
                    <div className="text-center bg-bg/60 rounded-xl p-2">
                      <p className="text-lg font-black text-purple-400">{cronResult.processedAwards ?? 0}</p>
                      <p className="text-[9px] text-muted">جوائز</p>
                    </div>
                  </div>

                  <p className="text-center text-xs text-muted">
                    إجمالي التوقعات المحدّثة: <span className="text-text font-black">{cronResult.totalPredictionsUpdated ?? 0}</span>
                  </p>

                  {/* تفاصيل المباريات */}
                  {cronResult.matches?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-text mb-1.5">⚽ المباريات</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {cronResult.matches.map((m, i) => (
                          <div key={i} className="flex items-center justify-between bg-bg/60 rounded-xl px-3 py-1.5 text-xs">
                            <span className="text-muted font-mono text-[10px]">#{m.matchId}</span>
                            <span className="font-black text-text">{m.homeScore} - {m.awayScore}</span>
                            <div className="flex gap-2">
                              <span className="text-green-400">{m.exact}✓✓</span>
                              <span className="text-gold">{m.winner}✓</span>
                              <span className="text-muted">{m.wrong}✗</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* تفاصيل المجموعات */}
                  {cronResult.groups?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-text mb-1.5">📊 المجموعات</p>
                      <div className="space-y-1">
                        {cronResult.groups.map((g, i) => (
                          <div key={i} className="flex items-center justify-between bg-bg/60 rounded-xl px-3 py-1.5 text-xs">
                            <span className="font-bold text-gold">
                              {g.slot === '1st' ? '🥇' : '🥈'} {g.group}
                            </span>
                            <span className="text-text font-bold">{g.actualTeam}</span>
                            <div className="flex gap-2">
                              <span className="text-green-400">{g.correct}✓</span>
                              <span className="text-muted">{g.wrong}✗</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* تفاصيل الجوائز */}
                  {cronResult.awards?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-text mb-1.5">🏆 الجوائز</p>
                      <div className="space-y-1">
                        {cronResult.awards.map((a, i) => (
                          <div key={i} className="flex items-center justify-between bg-bg/60 rounded-xl px-3 py-1.5 text-xs">
                            <span className="font-bold text-purple-400">{a.awardId}</span>
                            <span className="text-text">{a.actualValue}</span>
                            <div className="flex gap-2">
                              <span className="text-green-400">{a.correct}✓</span>
                              <span className="text-muted">{a.wrong}✗</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cronResult.totalPredictionsUpdated === 0 && (
                    <p className="text-xs text-muted text-center">لا توجد توقعات معلقة لمعالجتها الآن</p>
                  )}

                  {cronResult.errors?.length > 0 && (
                    <div className="p-2 rounded-xl bg-live/5 border border-live/20">
                      {cronResult.errors.map((e, i) => (
                        <p key={i} className="text-[10px] text-live">⚠️ {e}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* معلومة الـ Cron */}
          <div className="card p-4 border-border/40">
            <p className="text-xs text-muted leading-relaxed">
              ⏱️ <span className="text-text font-bold">جدول تلقائي:</span> كل 30 دقيقة عبر Vercel Cron.
              <br/>
              أضف <code className="text-primary">CRON_SECRET</code> = نفس <code className="text-primary">ADMIN_SECRET</code> في Vercel.
            </p>
          </div>
        </div>
      )}

      {/* ══ القفل ══ */}
      {tab === 'lock' && (
        <div className="space-y-4">
          {/* قفل الجوائز */}
          <div className="card p-5 space-y-3">
            <p className="font-black text-text">🏆 قفل توقعات الجوائز</p>
            <p className="text-xs text-muted">قفل الجوائز قبل دور الـ16 (لا يمكن تعديلها بعد ذلك)</p>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${lockSettings.awardsLocked ? 'text-live' : 'text-green-400'}`}>
                {lockSettings.awardsLocked ? '🔒 مقفل' : '🔓 مفتوح'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => sendLock('lock_awards', false)}
                  disabled={lockLoading || !lockSettings.awardsLocked}
                  className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-bold disabled:opacity-40"
                >
                  فتح
                </button>
                <button
                  onClick={() => sendLock('lock_awards', true)}
                  disabled={lockLoading || lockSettings.awardsLocked}
                  className="px-4 py-2 rounded-xl bg-live/20 text-live text-sm font-bold disabled:opacity-40"
                >
                  قفل
                </button>
              </div>
            </div>
          </div>

          {/* قفل المجموعات */}
          <div className="card p-5 space-y-3">
            <p className="font-black text-text">📊 قفل توقعات المجموعات</p>
            <p className="text-xs text-muted">اقفل مجموعة بعد انتهاء مباراتها الأولى</p>
            <div className="grid grid-cols-4 gap-2">
              {GROUPS.map(g => {
                const isLocked = lockSettings.lockedGroups.includes(g)
                return (
                  <button
                    key={g}
                    onClick={() => sendLock(isLocked ? 'unlock_group' : 'lock_group', g)}
                    disabled={lockLoading}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all ${
                      isLocked
                        ? 'bg-live/20 text-live border border-live/30'
                        : 'bg-card border border-border text-muted'
                    }`}
                  >
                    {isLocked ? '🔒' : '🔓'} {g}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => sendLock('lock_all_groups', GROUPS)}
                disabled={lockLoading}
                className="flex-1 py-2 rounded-xl bg-live/10 text-live text-xs font-bold border border-live/20"
              >
                قفل الكل
              </button>
              <button
                onClick={() => sendLock('unlock_all_groups', [])}
                disabled={lockLoading}
                className="flex-1 py-2 rounded-xl bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20"
              >
                فتح الكل
              </button>
            </div>
          </div>

          {/* ملاحظة المباريات */}
          <div className="card p-4 border border-border/40">
            <p className="text-xs text-muted leading-relaxed">
              ⏱️ <span className="text-text font-bold">توقعات المباريات</span> تُقفل تلقائياً قبل ساعة من موعد الكيك أوف — لا تحتاج إجراء يدوي.
            </p>
          </div>

          {/* نتيجة القفل */}
          {lockResult && (
            <div className={`card p-4 border-2 ${lockResult.startsWith('✅') ? 'border-green-400/40 bg-green-400/5' : 'border-live/40 bg-live/5'}`}>
              <p className={`font-bold text-sm ${lockResult.startsWith('✅') ? 'text-green-400' : 'text-live'}`}>
                {lockResult}
              </p>
            </div>
          )}
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
