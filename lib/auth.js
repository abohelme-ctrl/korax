import GoogleProvider   from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId:     process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'البريد الإلكتروني',
      credentials: {
        email:    { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور',        type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${STRAPI_URL}/api/auth/local`, {
            identifier: credentials.email,
            password:   credentials.password,
          })
          const { user, jwt } = res.data
          if (user && jwt) return { ...user, strapiToken: jwt }
          return null
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google' || account.provider === 'facebook') {
        // ── المحاولة الأولى: Strapi social callback ──────────────────────────
        try {
          const res = await axios.get(
            `${STRAPI_URL}/api/auth/${account.provider}/callback?access_token=${account.access_token}`
          )
          user.strapiToken = res.data.jwt
          user.strapiId    = res.data.user.id
          return true
        } catch {
          // Social callback غير مفعّل — نجرب البديل
        }

        // ── المحاولة الثانية: endpoint مخصص يُنشئ المستخدم تلقائياً ─────────
        try {
          const res = await axios.post(
            `${STRAPI_URL}/api/auth/social-token`,
            {
              email:    user.email,
              name:     user.name || user.email,
              provider: account.provider,
            },
            {
              headers: {
                'x-admin-secret': process.env.ADMIN_SECRET,
                'Content-Type':  'application/json',
              },
            }
          )
          user.strapiToken = res.data.jwt
          user.strapiId    = res.data.userId
        } catch (err2) {
          console.error('Strapi social-token fallback error:', err2.message)
          // نكمل بدون token — المستخدم يدخل لكن ميزات المجموعات لن تعمل
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.strapiToken = user.strapiToken
        token.strapiId    = user.strapiId || user.id
      }
      return token
    },

    async session({ session, token }) {
      session.strapiToken = token.strapiToken
      session.user.strapiId = token.strapiId
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}
