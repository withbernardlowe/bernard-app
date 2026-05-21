import type { Session } from '@supabase/supabase-js'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, LogOut, BookOpen, Type } from 'lucide-react'
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
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 rounded-md text-sm transition-colors ${
      isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
    }`

  return (
    <div data-stage="cream" className="min-h-dvh flex flex-col">
      <header className="border-b p-3 flex justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="font-semibold tracking-tight" style={{ fontFamily: 'var(--font-serif-tc)' }}>bernard-app</div>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/jp" className={navLinkClass}>日文</NavLink>
            <NavLink to="/show" className={navLinkClass}>大字</NavLink>
          </nav>
        </div>

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
              <DropdownMenuItem onSelect={() => navigate('/jp')}>
                <BookOpen />
                日文閃卡
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/show')}>
                <Type />
                大字顯示
              </DropdownMenuItem>
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
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
