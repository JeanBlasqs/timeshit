export interface Category {
  id: string
  Name: string
  Color: string
}

export interface Task {
  id?: string
  title: string
  description?: string
  start_at: string
  end_at: string
  category_id?: string
  color?: string
  status: 'nao_iniciado' | 'em_andamento' | 'concluido'
}

export interface Event extends Task {} // Manter compatibilidade
