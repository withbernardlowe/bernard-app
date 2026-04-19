import type { Session } from '@supabase/supabase-js'
import { Outlet } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Props {
  session: Session
}

export function AuthenticatedApp({ session }: Props) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b p-3 flex justify-between items-center gap-2">
        <div className="font-semibold">bernard-app</div>

        <div className="hidden md:flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{session.user.email}</span>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            登出
          </Button>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="選單">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="break-all">
                {session.user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="text-xs text-muted-foreground">主題</span>
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut}>
                <LogOut />
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-6 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  )
}
