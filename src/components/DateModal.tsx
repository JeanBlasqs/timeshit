import React from 'react'

interface DateModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: string) => void
  selectedDate?: string
}

export default function DateModal({ isOpen, onClose, onConfirm, selectedDate }: DateModalProps) {
  const [date, setDate] = React.useState(selectedDate || '')

  const handleConfirm = () => {
    if (date) {
      onConfirm(date)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Selecionar Data Final
        </h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full input-modern mb-4"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-md font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
