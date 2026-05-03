import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (error) {
          setError(error.message)
        } else {
          setMessage('Cadastro realizado com sucesso! Verifique seu email para confirmar.')
          setTimeout(() => {
            setIsSignUp(false)
          }, 2000)
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          setError(error.message)
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}>
            <img src="/calendar.png" alt="TimeShit" className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
            {isSignUp ? 'Criar conta' : 'Entrar no TimeShit'}
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {isSignUp 
              ? 'Preencha os dados para criar sua conta' 
              : 'Entre para gerenciar seus eventos'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}

          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  focusRingColor: 'var(--color-primary)'
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  focusRingColor: 'var(--color-primary)'
                }}
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ 
                backgroundColor: 'var(--color-primary)'
              }}
            >
              {loading ? 'Processando...' : (isSignUp ? 'Criar conta' : 'Entrar')}
            </button>
          </div>

          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setMessage('')
              }}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--color-primary)' }}
            >
              {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
