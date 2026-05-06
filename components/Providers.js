'use client'

import { SessionProvider } from 'next-auth/react'
import InstallPrompt from '@/components/InstallPrompt'
import { useEffect } from 'react'

// Apply saved theme before first paint to avoid flash
function ThemeInit() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('korax_theme')
      if (saved === 'light') {
        document.documentElement.classList.add('light')
      } else {
        document.documentElement.classList.remove('light')
      }
    } catch {}
  }, [])
  return null
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeInit />
      {children}
      <InstallPrompt />
    </SessionProvider>
  )
}
