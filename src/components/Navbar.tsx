import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { theme } = useTheme()

  useEffect(() => {
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        if (event === 'SIGNED_OUT') {
          navigate('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="shadow-lg" style={{ backgroundColor: theme === 'light' ? 'var(--color-primary)' : 'var(--color-primary-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center pl-12 sm:pl-0">
            <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
              TimeShit 💩
            </h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <ThemeToggle />
            
            {user && (
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Email - Oculto em mobile */}
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-secondary)' }}>
                    {user.email}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {user.user_metadata?.name || 'Usuário'}
                  </p>
                </div>
                
                {/* Avatar - Menor em mobile */}
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <span className="text-sm lg:text-base font-medium" style={{ color: 'var(--color-primary)' }}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                {/* Botão Sair - Texto oculto em mobile, só ícone */}
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center space-x-1 px-2 lg:px-4 py-2 text-sm transition-colors hover:scale-105"
                  style={{ color: 'var(--color-secondary)' }}
                  title="Sair"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden lg:inline">
                    {loading ? 'Saindo...' : 'Sair'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
