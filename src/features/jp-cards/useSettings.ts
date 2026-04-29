import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface JpSettings {
  showRuby: boolean
}

const DEFAULTS: JpSettings = {
  showRuby: false,
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
        .eq('key', 'jp_show_ruby')
      if (cancelled) return
      const next = { ...DEFAULTS }
      for (const row of data ?? []) {
        if (row.key === 'jp_show_ruby') next.showRuby = Boolean(row.value)
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
