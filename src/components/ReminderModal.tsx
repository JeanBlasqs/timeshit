import React from 'react'

interface ReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReminderFormData) => void
  loading?: boolean
}

export interface ReminderFormData {
  name: string
  start_date: string
  end_date: string
  priority: 'baixa' | 'media' | 'alta'
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}) => {
  const [formData, setFormData] = React.useState<ReminderFormData>({
    name: '',
    start_date: '',
    end_date: '',
    priority: 'baixa'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', start_date: '', end_date: '', priority: 'baixa' })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-lg shadow-xl"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {/* Cabeçalho */}
        <div 
          className="px-6 py-4 flex justify-between items-center border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h3 
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            Novo Lembrete
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded transition-colors hover:bg-opacity-10"
            style={{ color: 'var(--color-text)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Nome
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={loading}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                opacity: loading ? 0.6 : 1
              }}
              placeholder="Nome do lembrete"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Início
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                disabled={loading}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Fim
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                disabled={loading}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value as 'baixa' | 'media' | 'alta'})}
              disabled={loading}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                opacity: loading ? 0.6 : 1
              }}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-md text-white text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </div>
              ) : (
                'Salvar'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
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
    </div>
  )
}
