'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'korax_theme'

/**
 * useTheme — hook for dark/light mode
 * Returns: { theme, toggleTheme, setTheme }
 * theme: 'dark' | 'light'
 */
export function useTheme() {
  const [theme, setThemeState] = useState('dark')

  useEffect(() => {
    // Read saved preference on mount
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved)
      applyTheme(saved)
    } else {
      // Default to dark
      applyTheme('dark')
    }
  }, [])

  const setTheme = useCallback((t) => {
    setThemeState(t)
    applyTheme(t)
    localStorage.setItem(STORAGE_KEY, t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { theme, toggleTheme, setTheme }
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  if (theme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

/**
 * getInitialTheme — call this in Providers to apply theme before first paint
 * Prevents flash of wrong theme
 */
export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}
