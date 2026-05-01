interface StatusSelectorProps {
  value: 'nao_iniciado' | 'em_andamento' | 'concluido'
  onChange: (status: 'nao_iniciado' | 'em_andamento' | 'concluido') => void
  label?: string
}

const statusOptions = [
  { value: 'nao_iniciado', label: 'Não Iniciado', color: 'bg-gray-500', textColor: 'text-gray-700' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-500', textColor: 'text-green-700' }
]

export default function StatusSelector({ value, onChange, label }: StatusSelectorProps) {
  const selectedStatus = statusOptions.find(option => option.value === value)

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as 'nao_iniciado' | 'em_andamento' | 'concluido')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className={`w-3 h-3 rounded-full ${selectedStatus?.color || 'bg-gray-400'}`} />
        </div>
      </div>
    </div>
  )
}
