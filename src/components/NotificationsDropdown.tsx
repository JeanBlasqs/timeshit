import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { remindersService, type Reminder } from '../services/remindersService'

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    priority: 'baixa' as 'baixa' | 'media' | 'alta'
  })
  const { theme } = useTheme()

  // Carregar lembretes do banco
  useEffect(() => {
    if (isOpen) {
      loadReminders()
    }
  }, [isOpen])

  const loadReminders = async () => {
    try {
      setLoading(true)
      const data = await remindersService.fetchReminders()
      setReminders(data)
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baixa': return '#10B981' // verde
      case 'media': return '#F59E0B' // amarelo
      case 'alta': return '#EF4444' // vermelho
      default: return '#6B7280'
    }
  }

  const formatDate = (dateString: string) => {
    // Converter string YYYY-MM-DD para Date local sem UTC
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month - 1 porque JS usa 0-11
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    }).replace(/\//g, '/')
  }

  const getDaysRemaining = (startDate: string) => {
    const today = new Date()
    // Usar fuso horário local
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Converter string de data para Date local sem UTC
    const [year, month, day] = startDate.split('-').map(Number)
    const startLocal = new Date(year, month - 1, day) // month - 1 porque JS usa 0-11
    
    const diffTime = startLocal.getTime() - todayLocal.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `(atrasado ${Math.abs(diffDays)} dias)`
    } else if (diffDays === 0) {
      return `(realizar hoje)`
    } else if (diffDays === 1) {
      return `(restam 01 dia)`
    } else {
      return `(restam ${diffDays.toString().padStart(2, '0')} dias)`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar se a data inicial é anterior a hoje (usando fuso local)
    const today = new Date()
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Converter string de data para Date local sem UTC
    const [startYear, startMonth, startDay] = formData.start_date.split('-').map(Number)
    const startDate = new Date(startYear, startMonth - 1, startDay)
    
    if (startDate < todayLocal) {
      alert('Não é possível criar lembretes para datas anteriores a hoje.')
      return
    }ce
    
    // Validar se a data final é anterior à data inicial
    const [endYear, endMonth, endDay] = formData.end_date.split('-').map(Number)
    const endDate = new Date(endYear, endMonth - 1, endDay)
    
    if (endDate < startDate) {
      alert('A data final deve ser igual ou posterior à data inicial.')
      return
    }
    
    try {
      setLoading(true)
      const newReminder = await remindersService.createReminder({
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        priority: formData.priority
      })
      
      setReminders([newReminder, ...reminders])
      setFormData({ name: '', start_date: '', end_date: '', priority: 'baixa' })
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao criar lembrete:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      await remindersService.deleteReminder(id)
      setReminders(reminders.filter(r => r.id !== id))
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error)
    }
  }

  const completeReminder = async (id: string) => {
    try {
      await remindersService.completeReminder(id)
      setReminders(reminders.filter(r => r.id !== id))
    } catch (error) {
      console.error('Erro ao concluir lembrete:', error)
    }
  }

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notifications-dropdown')) {
        setIsOpen(false)
        setShowForm(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const bellIcon = theme === 'light' ?  '/bell.png' : '/bell white.png'
  const iconBgColor = theme === 'light' ? '#FFFFFF' : 'var(--color-primary)'

  return (
    <div className="relative notifications-dropdown">
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: iconBgColor }}
      >
        <img 
          src={bellIcon} 
          alt="Notificações" 
          className="w-5 h-5"
        />
        {reminders.length > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
          >
            {reminders.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-96 rounded-lg shadow-xl z-50 overflow-hidden"
          style={{ 
            backgroundColor: 'var(--color-surface)',
            border: `1px solid var(--color-border)`
          }}
        >
          {/* Cabeçalho */}
          <div 
            className="px-4 py-3 flex justify-between items-center"
            style={{ borderBottom: `1px solid var(--color-border)` }}
          >
            <h3 
              className="font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              Lembretes
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF'
              }}
            >
              +
            </button>
          </div>

          {/* Formulário */}
          {showForm && (
            <div 
              className="p-4"
              style={{ borderBottom: `1px solid var(--color-border)` }}
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Início
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-3 py-2 rounded-md border text-sm"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Fim
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-3 py-2 rounded-md border text-sm"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as 'baixa' | 'media' | 'alta'})}
                    className="w-full px-3 py-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 rounded-md text-white text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text)',
                      border: `1px solid var(--color-border)`
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de lembretes */}
          <div className="max-h-96 overflow-y-auto">
            {reminders.length === 0 ? (
              <div 
                className="p-8 text-center"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <p 
                  className="text-sm"
                  style={{ color: '#9CA3AF' }}
                >
                  Nenhum lembrete cadastrado
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {reminders.map((reminder) => (
                  <div 
                    key={reminder.id}
                    className="p-4 hover:bg-opacity-50 transition-colors group relative"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="absolute top-2 right-8 opacity-100 transition-opacity p-1 rounded hover:bg-red-100"
                    >
                      <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <button
                      onClick={() => completeReminder(reminder.id)}
                      className="absolute top-2 right-2 opacity-100 transition-opacity p-1 rounded hover:bg-green-100"
                      title="Marcar como concluído"
                    >
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>

                    <div 
                      className="font-medium text-sm mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {reminder.name}
                    </div>
                    
                    <div 
                      className="text-xs mb-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {formatDate(reminder.start_date)} até {formatDate(reminder.end_date)}
                      <span 
                        className="ml-2 font-medium"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {getDaysRemaining(reminder.start_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs capitalize"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {reminder.priority}
                      </span>
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
