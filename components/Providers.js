'use client'

import { SessionProvider } from 'next-auth/react'
import InstallPrompt from '@/components/InstallPrompt'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <InstallPrompt />
    </SessionProvider>
  )
}
