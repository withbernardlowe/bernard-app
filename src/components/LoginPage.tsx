import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; message: string }

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus({ kind: 'sending' })
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setStatus({ kind: 'error', message: error.message })
      return
    }
    setStatus({ kind: 'sent', email })
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>bernard-app</CardTitle>
          <CardDescription>Yuren 的私人 PWA</CardDescription>
        </CardHeader>
        <CardContent>
          {status.kind === 'sent' ? (
            <div className="space-y-3">
              <p className="text-sm">
                登入連結已寄到 <strong>{status.email}</strong>，去信箱點連結即可登入。
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStatus({ kind: 'idle' })}
              >
                換個 email 重試
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status.kind === 'sending'}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={status.kind === 'sending' || !email}
              >
                {status.kind === 'sending' ? '寄送中…' : '寄出登入連結'}
              </Button>
              {status.kind === 'error' && (
                <p className="text-sm text-destructive">{status.message}</p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
