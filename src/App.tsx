import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login.tsx'
import Calendar from './pages/Calendar.tsx'
import AuthCallback from './pages/AuthCallback.tsx'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_e, s) => setSession(s))
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={session ? <Calendar /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
