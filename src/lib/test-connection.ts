import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testando conexão com Supabase...')
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
    
    // Testar conexão básica
    const { data, error } = await supabase.from('events').select('count')
    
    if (error) {
      console.error('Erro na conexão:', error)
      return false
    }
    
    console.log('Conexão bem-sucedida!', data)
    return true
  } catch (err) {
    console.error('Erro ao testar conexão:', err)
    return false
  }
}
