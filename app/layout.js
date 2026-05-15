import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'KoraX - كأس العالم 2026 | توقعات ومباريات مونديال 2026',
  description: 'موقع كأس العالم 2026 — توقع نتائج المباريات، تابع المجموعات، قارن المنتخبات، وتنافس مع أصدقائك في مونديال أمريكا الشمالية',
  keywords: 'كأس العالم 2026, مونديال 2026, توقعات كأس العالم, مباريات كأس العالم, FIFA 2026, KoraX, كورا اكس, منتخبات كأس العالم, جدول مباريات مونديال 2026',
  manifest: '/manifest.json',
  icons: {
    icon:  '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KoraX',
  },
  openGraph: {
    title:       'KoraX - كأس العالم 2026',
    description: 'توقع النتائج وتنافس مع أصدقائك — Play · Predict · Win',
    type:        'website',
    locale:      'ar_SA',
    url:         'https://korax.live',
    siteName:    'KoraX',
    images: [{
      url:    'https://korax.live/logo.png',
      width:  1080,
      height: 1080,
      alt:    'KoraX - كأس العالم 2026',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'KoraX - كأس العالم 2026',
    description: 'توقع النتائج وتنافس مع أصدقائك',
    images:      ['https://korax.live/logo.png'],
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
        <link rel="apple-touch-icon" href="/logo.png" />
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
