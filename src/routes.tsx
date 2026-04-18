import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AuthenticatedApp } from '@/components/AuthenticatedApp'
import { ReviewScreen } from '@/features/jp-cards/ReviewScreen'

interface Props {
  session: Session
}

export function AppRoutes({ session }: Props) {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AuthenticatedApp session={session} />}>
          <Route index element={<Navigate to="/jp" replace />} />
          <Route path="/jp" element={<ReviewScreen />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
