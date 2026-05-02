import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'
import Swal from 'sweetalert2'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated: (category: Category) => void
}

export default function CategoryModal({ isOpen, onClose, onCategoryCreated }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3788d8')
  const [loading, setLoading] = useState(false)

  const showSuccessNotification = (title: string, message: string) => {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top-end',
      toast: true,
      customClass: {
        popup: 'swal2-toast',
        title: 'swal2-title',
        icon: 'swal2-icon'
      }
    })
  }

  const showLoadingNotification = (title: string, message: string) => {
    Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  const closeLoadingNotification = () => {
    Swal.close()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mostrar spinner de carregamento
    showLoadingNotification('Salvando', 'Criando categoria...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        closeLoadingNotification()
        return
      }

      const { data, error } = await supabase
        .from('categorias')
        .insert({
          Name: name,
          Color: color,
          user_id: user.id  // ← também estava faltando
        })

      if (error) {
        console.error('Error creating category:', error)
        closeLoadingNotification()
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao Criar',
          text: 'Erro ao criar categoria. Tente novamente.',
          confirmButtonColor: '#5F0000'
        })
      } else {
        if (data && data[0]) {
          onCategoryCreated(data[0])
        } else {
          // Se não retornou dados, cria um objeto com os dados do formulário
          onCategoryCreated({
            Name: name,
            Color: color,
            id: Date.now().toString() // ID temporário
          })
        }
        setName('')
        setColor('#3788d8')
        onClose()
        
        // Mostrar notificação de sucesso
        closeLoadingNotification()
        showSuccessNotification('Sucesso!', 'Categoria criada com sucesso!')
      }
    } catch (err) {
      console.error('Error completo:', err)
      console.error('Error type:', typeof err)
      console.error('Error message:', (err as any)?.message)
      closeLoadingNotification()
      await Swal.fire({
        icon: 'error',
        title: 'Erro Inesperado',
        text: 'Erro inesperado ao criar categoria. Tente novamente.',
        confirmButtonColor: '#5F0000'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setColor('#3788d8')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 overlay-glass flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-6 p-8 rounded-lg shadow-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          Nova Categoria
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Nome da Categoria
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full input-modern"
              placeholder="Ex: Trabalho, Pessoal, Estudos..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              Cor
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer"
                style={{ border: '1px solid var(--color-border)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{color}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 rounded-md transition-colors hover-scale"
              style={{ 
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md transition-colors btn-wine hover-scale"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
