import type { Session } from '@supabase/supabase-js'
import { Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface Props {
  session: Session
}

export function AuthenticatedApp({ session }: Props) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b p-3 flex justify-between items-center">
        <div className="font-semibold">bernard-app</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{session.user.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            登出
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  )
}
