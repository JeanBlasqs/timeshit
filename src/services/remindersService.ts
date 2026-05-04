import { supabase } from '../lib/supabase'

export interface Reminder {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string
  priority: 'baixa' | 'media' | 'alta'
  created_at: string
  updated_at: string
}

export const remindersService = {
  // Buscar todos os lembretes do usuário
  async fetchReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reminders:', error)
      throw error
    }

    return data || []
  },

  // Criar novo lembrete
  async createReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        ...reminder,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reminder:', error)
      throw error
    }

    return data
  },

  // Deletar lembrete
  async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting reminder:', error)
      throw error
    }
  },

  // Marcar lembrete como concluído (deletar)
  async completeReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error completing reminder:', error)
      throw error
    }
  }

  // Atualizar lembrete
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating reminder:', error)
      throw error
    }

    return data
  }
}
