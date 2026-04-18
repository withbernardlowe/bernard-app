import { useEffect, useState, useCallback } from 'react'
import {
  type Theme,
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
} from '@/lib/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())

  const setTheme = useCallback((t: Theme) => {
    setStoredTheme(t)
    setThemeState(t)
    applyTheme(t)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (getStoredTheme() === 'system') applyTheme('system')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return { theme, setTheme, resolved: resolveTheme(theme) }
}
