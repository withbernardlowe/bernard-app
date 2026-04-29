import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AuthenticatedApp } from '@/components/AuthenticatedApp'
import { Home } from '@/features/jp-cards/Home'
import { LessonView } from '@/features/jp-cards/LessonView'
import { DueReviewView } from '@/features/jp-cards/DueReviewView'

interface Props {
  session: Session
}

export function AppRoutes({ session }: Props) {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AuthenticatedApp session={session} />}>
          <Route index element={<Navigate to="/jp" replace />} />
          <Route path="/jp" element={<Home />} />
          <Route path="/jp/lesson/:date" element={<LessonView />} />
          <Route path="/jp/due" element={<DueReviewView />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
