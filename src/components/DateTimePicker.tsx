import { useRef } from 'react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Portuguese } from 'flatpickr/dist/l10n/pt'
import '../styles/datetimepicker.css'

interface DateTimePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  label?: string
  required?: boolean
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = 'Selecione data e hora',
  label,
  required = false
}: DateTimePickerProps) {
  const fpRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLabelClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
      fpRef.current?.flatpickr?.open()
    }
  }

  return (
    <div>
      {label && (
        <label 
          className="block text-sm font-medium mb-2 cursor-pointer" 
          style={{ 
            color: 'var(--color-text)',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          }}
          onClick={handleLabelClick}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* wrap: true exige esse div pai com data-input e data-toggle */}
      <Flatpickr
        ref={fpRef}
        value={value ? new Date(value) : undefined}
        onChange={([date]) => {
          if (date) {
            const pad = (n: number) => String(n).padStart(2, '0')
            const local = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
            onChange(local)
          }
        }}
        options={{
          locale: Portuguese,
          enableTime: true,
          dateFormat: 'd/m/Y H:i',
          time_24hr: true,
          minuteIncrement: 15,
          defaultHour: 9,
          defaultMinute: 0,
          position: 'auto center',
          disableMobile: true,
          wrap: false,
          clickOpens: true,
        }}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 input-modern"
        placeholder={placeholder}
        style={{
          fontSize: '16px',
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          borderRadius: 8,
          cursor: 'pointer'
        }}
      />
    </div>
  )
}