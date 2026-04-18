import { useSession } from '@/hooks/useSession'
import { LoginPage } from '@/components/LoginPage'
import { AuthenticatedApp } from '@/components/AuthenticatedApp'

function App() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-sm text-muted-foreground">載入中…</div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return <AuthenticatedApp session={session} />
}

export default App
