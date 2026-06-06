'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { joinGroup, setUserToken } from '@/lib/strapi'
import Link from 'next/link'

export default function JoinGroupPage() {
  const { code }   = useParams()
  const router     = useRouter()
  const { isLoggedIn, isLoading, strapiToken } = useAuth()

  const [status,    setStatus]    = useState('loading')
  const [groupName, setGroupName] = useState('')
  const [error,     setError]     = useState('')
  const [done,      setDone]      = useState(false) // منع التكرار

  useEffect(() => {
    if (isLoading || !code || done) return

    // غير مسجّل → شاشة الدخول
    if (!isLoggedIn) {
      setStatus('login')
      return
    }

    // مسجّل دخول لكن بدون strapiToken → خطأ واضح
    if (!strapiToken) {
      setError('تعذّر التحقق من حسابك. سجّل الخروج وأعد الدخول مجدداً.')
      setStatus('error')
      return
    }

    // مسجّل دخول → انضم تلقائياً (مرة واحدة فقط)
    setDone(true)
    setStatus('joining')
    setUserToken(strapiToken)

    joinGroup(code.toUpperCase())
      .then(group => {
        const name = group?.name || group?.data?.attributes?.name || ''
        setGroupName(name)
        setStatus('success')
        setTimeout(() => router.replace('/predict'), 2000)
      })
      .catch(err => {
        const status = err?.response?.status
        const msg    = err?.response?.data?.error?.message || err?.message || ''
        // عضو بالفعل → نجاح
        if (msg.includes('already') || msg.includes('موجود') || msg.includes('عضو')) {
          setStatus('success')
          setTimeout(() => router.replace('/predict'), 2000)
        } else if (status === 401 || status === 403) {
          setError('انتهت صلاحية جلستك. سجّل الخروج وأعد الدخول.')
          setStatus('error')
        } else if (status === 404 || msg.includes('غير صحيح')) {
          setError('الكود غير صحيح أو انتهت صلاحية المجموعة.')
          setStatus('error')
        } else if (!status) {
          setError('تعذّر الاتصال بالخادم. تحقق من الاتصال بالإنترنت.')
          setStatus('error')
        } else {
          setError(`حدث خطأ (${status}). حاول مجدداً.`)
          setStatus('error')
        }
      })
  }, [isLoading, isLoggedIn, strapiToken, code, done])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="w-full max-w-sm">

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">جاري التحميل...</p>
          </div>
        )}

        {/* Joining */}
        {status === 'joining' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h1 className="font-black text-xl text-text mb-2">جاري الانضمام...</h1>
            <p className="text-muted text-sm mb-6">الكود: <span className="font-black text-primary tracking-widest">{code}</span></p>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="card p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-black text-2xl text-text mb-2">انضممت بنجاح!</h1>
            <p className="text-muted text-sm mb-6">
              أهلاً في مجموعة <span className="font-bold text-primary">"{groupName}"</span>
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-6">
              <p className="text-xs text-muted">جاري الانتقال إلى صفحة الترتيب...</p>
            </div>
            <Link
              href="/predict"
              className="w-full py-4 rounded-2xl bg-primary font-bold text-white text-center block active:scale-95 transition-transform"
            >
              عرض مجموعاتي الآن
            </Link>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="font-black text-xl text-text mb-2">تعذّر الانضمام</h1>
            <p className="text-sm text-muted mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                href="/predict"
                className="w-full py-4 rounded-2xl bg-primary font-bold text-white text-center block active:scale-95 transition-transform"
              >
                إدخال الكود يدوياً
              </Link>
              <Link
                href="/"
                className="w-full py-4 rounded-2xl bg-card border border-border font-bold text-muted text-center block active:scale-95 transition-transform"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        )}

        {/* Not logged in */}
        {status === 'login' && (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h1 className="font-black text-xl text-text mb-2">دعوة للانضمام</h1>
            <p className="text-muted text-sm mb-2">
              تمت دعوتك للانضمام لمجموعة في <span className="font-bold text-primary">KoraX</span>
            </p>
            <div className="bg-card border border-border rounded-2xl p-3 mb-6">
              <p className="text-xs text-muted mb-1">كود المجموعة</p>
              <p className="font-black text-primary tracking-widest text-lg">{code}</p>
            </div>
            <p className="text-xs text-muted mb-4">سجّل دخولك أولاً لتنضم تلقائياً</p>
            <Link
              href={`/login?redirect=/join/${code}`}
              className="w-full py-4 rounded-2xl bg-primary font-bold text-white text-center block active:scale-95 transition-transform"
            >
              تسجيل الدخول والانضمام
            </Link>
            <Link
              href="/"
              className="w-full py-4 rounded-2xl bg-card border border-border font-bold text-muted text-center block mt-3 active:scale-95 transition-transform"
            >
              تصفح الموقع
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
