'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { setUserToken } from './strapi'

/**
 * useAuth — hook موحّد للمصادقة في KoraX
 *
 * يُعيد:
 *   user          — بيانات المستخدم (أو null)
 *   strapiToken   — JWT للاتصال بـ Strapi
 *   isLoading     — جاري التحقق من الجلسة
 *   isLoggedIn    — هل المستخدم مسجّل الدخول؟
 *   login(provider) — تسجيل الدخول
 *   logout()        — تسجيل الخروج
 */
export function useAuth() {
  const { data: session, status } = useSession()

  // ضبط رمز JWT لطلبات Strapi تلقائياً
  if (session?.strapiToken) {
    setUserToken(session.strapiToken)
  }

  return {
    user:        session?.user || null,
    strapiToken: session?.strapiToken || null,
    strapiId:    session?.user?.strapiId || null,
    isLoading:   status === 'loading',
    isLoggedIn:  status === 'authenticated',
    login:  (provider = 'google', opts = {}) => signIn(provider, { callbackUrl: '/', ...opts }),
    logout: () => signOut({ callbackUrl: '/login' }),
  }
}
