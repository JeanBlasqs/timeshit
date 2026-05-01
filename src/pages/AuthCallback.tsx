import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar se há um hash na URL (indicando callback do Supabase)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Sessão do Supabase com os tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Erro ao definir sessão:', error)
            setError('Erro ao confirmar sua conta. Por favor, tente fazer login novamente.')
            setTimeout(() => navigate('/login'), 3000)
            return
          }

          if (data.session) {
            console.log('Sessão estabelecida com sucesso')
            // Redirecionar para o calendar após sucesso
            navigate('/')
            return
          }
        } else {
          // Se não houver tokens, verificar se há sessão atual
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            console.log('Usuário já está logado')
            navigate('/')
            return
          } else {
            setError('Confirmação de email inválida ou expirada. Por favor, tente fazer login novamente.')
            setTimeout(() => navigate('/login'), 3000)
          }
        }
      } catch (err) {
        console.error('Erro no callback de autenticação:', err)
        setError('Ocorreu um erro ao processar sua confirmação. Por favor, tente fazer login novamente.')
        setTimeout(() => navigate('/login'), 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirmando sua conta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro na Confirmação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecionando para a página de login...</p>
        </div>
      </div>
    )
  }

  return null
}
