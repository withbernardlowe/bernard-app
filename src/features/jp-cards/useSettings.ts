import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface JpSettings {
  showRuby: boolean
  dailyNewLimit: number
}

const DEFAULTS: JpSettings = {
  showRuby: false,
  dailyNewLimit: 10,
}

export function useJpSettings() {
  const [settings, setSettings] = useState<JpSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('app_meta')
        .select('key, value')
        .in('key', ['jp_show_ruby', 'jp_daily_new_limit'])
      if (cancelled) return
      const next = { ...DEFAULTS }
      for (const row of data ?? []) {
        if (row.key === 'jp_show_ruby') next.showRuby = Boolean(row.value)
        if (row.key === 'jp_daily_new_limit')
          next.dailyNewLimit = Number(row.value)
      }
      setSettings(next)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function setShowRuby(showRuby: boolean) {
    setSettings((s) => ({ ...s, showRuby }))
    await supabase.from('app_meta').upsert({
      key: 'jp_show_ruby',
      value: showRuby,
    })
  }

  return { settings, loading, setShowRuby }
}
