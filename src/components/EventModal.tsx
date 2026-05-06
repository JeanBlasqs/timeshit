import { useState, useEffect } from 'react'
import type { Event, Category } from '../types'
import { supabase } from '../lib/supabase'
import StatusSelector from './StatusSelector'
import Swal from 'sweetalert2'
import DateModal from './DateModal'
import React, { Fragment } from 'react'

interface EventModalProps {
  event?: Event | null
  selectedDate?: string | null
  onClose: () => void
  onSave: (eventData: Partial<Event>) => Promise<void>
  onDelete?: () => Promise<void>
}

export default function EventModal({ event, selectedDate, onClose, onSave, onDelete }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'nao_iniciado' | 'em_andamento' | 'concluido'>('nao_iniciado')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [repeats, setRepeats] = useState(false)
  const [repeatDays, setRepeatDays] = useState<string[]>([])
  const [repeatEnds, setRepeatEnds] = useState<'never' | 'on'>('never')
  const [repeatEndDate, setRepeatEndDate] = useState('')
  const [showDateModal, setShowDateModal] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      // Corrigir fuso horário ao carregar datas
      const startDate = new Date(event.start_at)
      const endDate = new Date(event.end_at)
      startDate.setHours(startDate.getHours() - 3)
      endDate.setHours(endDate.getHours() - 3)
      
      setStartAt(startDate.toISOString().replace('Z', '-03:00'))
      setEndAt(endDate.toISOString().replace('Z', '-03:00'))
            setCategoryId(event.category_id || '')
      setStatus(event.status || 'nao_iniciado')
    } else if (selectedDate) {
      // Adicionar hora padrão se só tiver data
      const dateTime = selectedDate.includes('T') ? selectedDate : `${selectedDate}T09:00:00-03:00`
      setStartAt(dateTime)
      setEndAt(dateTime)
      setStatus('nao_iniciado')
    }
  }, [event, selectedDate])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
    
    if (error) {
      console.error('Error fetching categories:', error)
      return
    }
    
    setCategories(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar datas
      if (!startAt || !endAt) {
        await Swal.fire({
          icon: 'warning',
          title: 'Datas Obrigatórias',
          text: 'Por favor, selecione as datas de início e fim',
          confirmButtonColor: '#5F0000',
          iconColor: '#5F0000'
        })
        setLoading(false)
        return
      }

      if (new Date(startAt) >= new Date(endAt)) {
        await Swal.fire({
          icon: 'warning',
          title: 'Data Inválida',
          text: 'A data de fim deve ser posterior à data de início',
          confirmButtonColor: '#5F0000',
          iconColor: '#5F0000'
        })
        setLoading(false)
        return
      }

      if (!categoryId) {
        await Swal.fire({
          icon: 'warning',
          title: 'Categoria Obrigatória',
          text: 'Por favor, selecione uma categoria para a tarefa',
          confirmButtonColor: '#5F0000',
          iconColor: '#5F0000'
        })
        setLoading(false)
        return
      }

      const eventData = {
        title,
        description,
        start_at: startAt,  
        end_at: endAt,      
        category_id: categoryId,
        status,
        repeats,
        repeatDays,
        repeatEnds
      }
      
      await onSave(eventData)
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-lg shadow-xl"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          border: '3px solid #5F0000',
          maxHeight: '90vh',
          boxSizing: 'border-box'
        }}
      >
        <div className="p-3 pr-4 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {event ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover-scale"
              style={{ 
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 overflow-hidden">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full input-modern"
              required
              placeholder="Digite o título da tarefa"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full input-modern"
              rows={2}
              placeholder="Adicione uma descrição (opcional)"
            />
          </div>

          <div className="space-y-2">
            {/* Linha 1 - Início (Data + Hora) */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Início *
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="date"
                  value={startAt ? startAt.split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (startAt) {
                      const existingTime = startAt.split('T')[1]?.slice(0, 5) ?? '09:00';
                      setStartAt(`${newDate}T${existingTime}:00`);
                    } else {
                      setStartAt(`${newDate}T09:00:00`);
                    }
                  }}
                  className="w-full input-modern"
                  required
                  style={{
                    fontSize: '13px',
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    padding: '6px 8px'
                  }}
                />
                <input
                  type="time"
                  value={startAt ? startAt.split('T')[1]?.slice(0, 5) ?? '09:00' : '09:00'}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    if (startAt) {
                      const existingDate = startAt.split('T')[0];
                      setStartAt(`${existingDate}T${newTime}:00`);
                    } else {
                      setStartAt(`${new Date().toISOString().split('T')[0]}T${newTime}:00`);
                    }
                  }}
                  className="w-full input-modern"
                  required
                  style={{
                    fontSize: '13px',
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    padding: '6px 8px'
                  }}
                />
              </div>
            </div>

            {/* Linha 2 - Fim (Data + Hora) */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Fim *
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="date"
                  value={endAt ? endAt.split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (endAt) {
                      const existingTime = endAt.split('T')[1]?.slice(0, 5) ?? '10:00';
                      setEndAt(`${newDate}T${existingTime}:00`);
                    } else {
                      setEndAt(`${newDate}T10:00:00`);
                    }
                  }}
                  className="w-full input-modern"
                  required
                  style={{
                    fontSize: '13px',
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    padding: '6px 8px'
                  }}
                />
                <input
                  type="time"
                  value={endAt ? endAt.split('T')[1]?.slice(0, 5) ?? '10:00' : '10:00'}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    if (endAt) {
                      const existingDate = endAt.split('T')[0];
                      setEndAt(`${existingDate}T${newTime}:00`);
                    } else {
                      setEndAt(`${new Date().toISOString().split('T')[0]}T${newTime}:00`);
                    }
                  }}
                  className="w-full input-modern"
                  required
                  style={{
                    fontSize: '13px',
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    padding: '6px 8px'
                  }}
                />
              </div>
            </div>
          </div>

          <StatusSelector
            value={status}
            onChange={setStatus}
            label="Status"
          />

          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              Categoria *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full input-modern"
            >
              <option value="">Selecione uma categoria *</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Repetição */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              <input
                type="checkbox"
                checked={repeats}
                onChange={(e) => setRepeats(e.target.checked)}
                className="mr-2"
              />
              Se repete?
            </label>
          </div>

          {/* Opções de Repetição (expandível) */}
          {repeats && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Dias da semana:
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'domingo', label: 'D' },
                    { id: 'segunda', label: 'S' },
                    { id: 'terca', label: 'T' },
                    { id: 'quarta', label: 'Q' },
                    { id: 'quinta', label: 'Q' },
                    { id: 'sexta', label: 'S' },
                    { id: 'sabado', label: 'S' }
                  ].map((day) => (
                    <label key={day.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={repeatDays.includes(day.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRepeatDays([...repeatDays, day.id])
                          } else {
                            setRepeatDays(repeatDays.filter(d => d !== day.id))
                          }
                        }}
                        className="mr-1 w-4 h-4 rounded-full appearance-none border-2 border-gray-300 checked:border-wine-600 checked:bg-wine-600"
                        style={{ 
                          backgroundColor: repeatDays.includes(day.id) ? 'var(--color-primary)' : 'transparent',
                          borderColor: repeatDays.includes(day.id) ? 'var(--color-primary)' : '#d1d5db'
                        }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Terminar em:
                </label>
                <select
                  value={repeatEnds}
                  onChange={(e) => setRepeatEnds(e.target.value as 'never' | 'on')}
                  className="w-full input-modern"
                >
                  <option value="never">Nunca</option>
                  <option value="on">Em:</option>
                </select>
              </div>

              {repeatEnds === 'on' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Data final:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDateModal(true)}
                    className="w-full input-modern text-left"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{repeatEndDate || 'Selecione uma data'}</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>📅</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md transition-colors hover-scale"
              style={{ 
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
            >
              Cancelar
            </button>
            
            <div className="flex space-x-3">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
                      onDelete()
                    }
                  }}
                  className="px-6 py-2 rounded-md transition-colors hover-scale"
                  style={{ 
                    color: 'white',
                    backgroundColor: '#dc2626'
                  }}
                >
                  Excluir
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-md transition-colors btn-wine hover-scale"
                style={{
                  border: '1px solid var(--color-primary)'
                }}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
      {showDateModal && (
    <Fragment>
      <DateModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onConfirm={(date) => setRepeatEndDate(date)}
        selectedDate={repeatEndDate}
      />
    </Fragment>
  )}
  </div>
  )
}

