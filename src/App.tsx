import { useSession } from '@/hooks/useSession'
import { LoginPage } from '@/components/LoginPage'
import { AppRoutes } from '@/routes'

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

  return <AppRoutes session={session} />
}

export default App
