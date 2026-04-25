import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'KoraX - كأس العالم 2026',
  description: 'توقعات وإحصائيات ومباريات كأس العالم 2026 — ابنِ فريقك وتنافس مع أصدقائك',
  keywords: 'كأس العالم 2026, توقعات, مباريات, كرة القدم, KoraX',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KoraX',
  },
  openGraph: {
    title: 'KoraX - كأس العالم 2026',
    description: 'توقع النتائج وتنافس مع أصدقائك',
    type: 'website',
    locale: 'ar_SA',
  },
}

export const viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
