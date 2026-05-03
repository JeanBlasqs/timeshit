import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../lib/supabase'
import type { Event } from '../types'
import Navbar from '../components/Navbar.tsx'
import EventModal from '../components/EventModal.tsx'
import CategoryModal from '../components/CategoryModal.tsx'
import ptBr from '@fullcalendar/core/locales/pt-br'
import '../styles/calendar.css'
import '../styles/theme.css'
import { getStatusColor } from '../utils/statusColors'
import { getContrastColor } from '../utils/colors'
import Swal from 'sweetalert2'

export default function Calendar() {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedStatus, setExpandedStatus] = useState<Set<string>>(new Set())
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  
  useEffect(() => {
    // Pegar usuário logado
    getUser()
    // Carregar categorias primeiro
    fetchCategories()
    // Testar conexão primeiro
    testConnection()
  }, [])

  useEffect(() => {
    // Chamar fetchEvents quando categorias estiverem carregadas
    if (categories.length > 0) {
      fetchEvents()
    }
  }, [categories])

  useEffect(() => {
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          // Não chamar fetchEvents aqui, deixe o useEffect de categories cuidar disso
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    console.log('User logged in:', user)
  }

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

  const testConnection = async () => {
    try {
      console.log('Testando conexão com Supabase...')
      console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
      
      // Testar conexão básica
      const { data, error } = await supabase.from('eventos').select('count')
      
      if (error) {
        console.error('Erro na conexão:', error)
      } else {
        console.log('Conexão bem-sucedida!', data)
      }
    } catch (err) {
      console.error('Erro ao testar conexão:', err)
    }
  }

  
  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    let query = supabase
      .from('eventos')
      .select('*')
      .eq('user_id', user.id)
    
    // Se houver categoria selecionada, filtrar por categoria também
    if (selectedCategory) {
      query = query.eq('categoria_id', selectedCategory)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching events:', error)
      return
    }

    const formattedEvents = data?.map(event => {
      // Encontrar a categoria para obter a cor
      const category = categories.find(cat => cat.id === event.categoria_id)
      const categoryColor = category?.Color || '#5F0000'
      
      return {
        id: event.id,
        title: event.Titulo,
        start: event.DataHoraInicio,
        end: event.DataHoraFinal,
        allDay: false,
        backgroundColor: categoryColor,
        textColor: getContrastColor(categoryColor),
        extendedProps: {
          description: event.Descricao,
          category_id: event.categoria_id,
          category_name: category?.Name || 'Sem categoria',
          status: event.status || 'nao_iniciado',
          statusColor: getStatusColor(event.status || 'nao_iniciado')
        }
      }
    }) || []

    setEvents(formattedEvents)
  }

  
  const handleEventClick = async (arg: any) => {
    // Validar datas antes de definir o evento
    const startDate = arg.event.start?.toISOString()
    const endDate = arg.event.end?.toISOString()
    
    if (!startDate || !endDate) {
      console.error('Evento com datas inválidas')
      await Swal.fire({
        icon: 'error',
        title: 'Evento Inválido',
        text: 'Este evento possui datas inválidas e não pode ser editado',
        confirmButtonColor: '#5F0000'
      })
      return
    }

    setSelectedEvent({
      id: arg.event.id,
      title: arg.event.title,
      description: arg.event.extendedProps.description,
      start_at: startDate,
      end_at: endDate,
      category_id: arg.event.extendedProps.category_id,
      color: arg.event.backgroundColor,
      status: arg.event.extendedProps.status || 'nao_iniciado'
    })
    setShowModal(true)
  }

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    // Validar campos obrigatórios antes de salvar
    if (!eventData.title || eventData.title.trim() === '') {
      console.error('Título não pode ser vazio')
      await Swal.fire({
        icon: 'warning',
        title: 'Título Obrigatório',
        text: 'Por favor, preencha o título da tarefa',
        confirmButtonColor: '#5F0000',
        iconColor: '#5F0000'
      })
      return
    }

    if (!eventData.start_at || !eventData.end_at) {
      console.error('Data de início ou fim não pode ser vazia')
      await Swal.fire({
        icon: 'warning',
        title: 'Datas Obrigatórias',
        text: 'Por favor, preencha as datas de início e fim',
        confirmButtonColor: '#5F0000',
        iconColor: '#5F0000'
      })
      return
    }

    if (!user?.id) {
      console.error('Usuário não autenticado')
      await Swal.fire({
        icon: 'error',
        title: 'Erro de Autenticação',
        text: 'Por favor, faça login novamente.',
        confirmButtonColor: '#5F0000'
      })
      return
    }

    const userId = String(user.id)
    if (!userId || userId === 'undefined' || userId === 'null' || userId === '') {
      console.error('ID de usuário inválido:', user.id)
      await Swal.fire({
        icon: 'error',
        title: 'Erro de Autenticação',
        text: 'ID de usuário inválido.',
        confirmButtonColor: '#5F0000'
      })
      return
    }

    // Mostrar spinner de carregamento
    showLoadingNotification('Salvando', selectedEvent?.id ? 'Atualizando tarefa...' : 'Criando tarefa...')

    try {
      if (selectedEvent?.id) {
        // Update existing event
        const { error } = await supabase
          .from('eventos')
          .update({
            Titulo: eventData.title,
            Descricao: eventData.description,
            DataHoraInicio: eventData.start_at,
            DataHoraFinal: eventData.end_at,
            Color: eventData.color,
            categoria_id: eventData.category_id && eventData.category_id !== '' ? eventData.category_id : null,
            status: eventData.status,
            user_id: userId
          })
          .eq('id', selectedEvent.id)
        
        if (error) {
          console.error('Error updating event:', error)
          closeLoadingNotification()
          await Swal.fire({
            icon: 'error',
            title: 'Erro ao Atualizar',
            text: 'Erro ao atualizar tarefa: ' + error.message,
            confirmButtonColor: '#5F0000'
          })
          return
        }
        
        // Mostrar notificação de sucesso
        closeLoadingNotification()
        showSuccessNotification('Sucesso!', 'Tarefa atualizada com sucesso!')
      } else {
        // Create new event
        const eventDataToInsert = {
          Titulo: eventData.title,
          Descricao: eventData.description || '',
          DataHoraInicio: eventData.start_at,
          DataHoraFinal: eventData.end_at,
          Color: eventData.color,
          categoria_id: eventData.category_id && eventData.category_id !== '' ? eventData.category_id : null,
          status: eventData.status || 'nao_iniciado',
          user_id: userId
        }
        
        const { error } = await supabase
          .from('eventos')
          .insert(eventDataToInsert)
        
        if (error) {
          console.error('Error creating event:', error)
          closeLoadingNotification()
          await Swal.fire({
            icon: 'error',
            title: 'Erro ao Criar',
            text: 'Erro ao criar tarefa: ' + error.message,
            confirmButtonColor: '#5F0000'
          })
          return
        }
        
        // Mostrar notificação de sucesso
        closeLoadingNotification()
        showSuccessNotification('Sucesso!', 'Tarefa criada com sucesso!')
      }

      setShowModal(false)
      setSelectedEvent(null)
      setSelectedDate(null)
      fetchEvents()
    } catch (error) {
      console.error('Error in handleSaveEvent:', error)
      closeLoadingNotification()
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao Salvar',
        text: 'Erro ao salvar tarefa',
        confirmButtonColor: '#5F0000'
      })
    }
  }

  const handleTaskClick = (event: any) => {
    const calendarApi = calendarRef.current?.getApi()
    if (!calendarApi) return

    // start pode ser string ou objeto Date — trata os dois casos
    const rawStart = event.start
    const eventDate = rawStart instanceof Date
      ? rawStart.toISOString().split('T')[0]
      : String(rawStart).split('T')[0]

    calendarApi.changeView('timeGridDay', eventDate)
    setIsSidebarOpen(false) // fecha sidebar pra ver o calendário
  }

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', eventId)
    
    if (error) {
      console.error('Error deleting event:', error)
      return
    }

    setShowModal(false)
    setSelectedEvent(null)
    fetchEvents()
  }

  const handleCategoryCreated = (category: any) => {
    setCategories([...categories, category])
    setShowCategoryModal(false)
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const getEventsByCategory = (categoryId: string) => {
    return events.filter(event => event.extendedProps?.category_id === categoryId)
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setShowEditCategoryModal(true)
  }

  const handleUpdateCategory = async (updatedData: { Name: string; Color: string }) => {
    if (!editingCategory) return

    // Mostrar spinner de carregamento
    showLoadingNotification('Salvando', 'Atualizando categoria...')

    try {
      const { error } = await supabase
        .from('categorias')
        .update({
          Name: updatedData.Name,
          Color: updatedData.Color
        })
        .eq('id', editingCategory.id)

      if (error) {
        console.error('Error updating category:', error)
        closeLoadingNotification()
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao Atualizar',
          text: 'Erro ao atualizar categoria. Tente novamente.',
          confirmButtonColor: '#5F0000'
        })
        return
      }

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, Name: updatedData.Name, Color: updatedData.Color }
          : cat
      ))
      setShowEditCategoryModal(false)
      setEditingCategory(null)
      
      // Mostrar notificação de sucesso
      closeLoadingNotification()
      showSuccessNotification('Sucesso!', 'Categoria atualizada com sucesso!')
    } catch (error) {
      console.error('Error in handleUpdateCategory:', error)
      closeLoadingNotification()
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao Atualizar',
        text: 'Erro ao atualizar categoria',
        confirmButtonColor: '#5F0000'
      })
    }
  }

  const handleDeleteCategoryClick = (categoryId: string) => {
    setCategoryToDelete(categoryId)
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      // Primeiro, remover a categoria de todas as tarefas que a usam
      const { error: updateError } = await supabase
        .from('eventos')
        .update({ categoria_id: null })
        .eq('categoria_id', categoryToDelete)
      
      if (updateError) {
        console.error('Error updating events:', updateError)
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao Atualizar',
          text: 'Erro ao atualizar tarefas da categoria',
          confirmButtonColor: '#5F0000'
        })
        return
      }
      
      // Depois, excluir a categoria
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', categoryToDelete)
      
      if (error) {
        console.error('Error deleting category:', error)
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao Excluir',
          text: 'Erro ao excluir categoria',
          confirmButtonColor: '#5F0000'
        })
        return
      }
      
      // Atualizar estado local
      setCategories(categories.filter(cat => cat.id !== categoryToDelete))
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory('')
      }
      setShowDeleteConfirmModal(false)
      setCategoryToDelete('')
      
      // Mostrar notificação de sucesso
      showSuccessNotification('Sucesso!', 'Categoria excluída com sucesso!')
    } catch (error) {
      console.error('Error in confirmDeleteCategory:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao Excluir',
        text: 'Erro ao excluir categoria',
        confirmButtonColor: '#5F0000'
      })
    }
  }

  const getEventsByStatus = () => {
    const statusGroups: Record<string, any[]> = {
      nao_iniciado: [],
      em_andamento: [],
      concluido: []
    }
    
    events.forEach(event => {
      const status = event.extendedProps?.status || 'nao_iniciado'
      if (statusGroups[status as keyof typeof statusGroups]) {
        statusGroups[status as keyof typeof statusGroups].push(event)
      }
    })
    
    return statusGroups
  }

  const toggleStatus = (status: string) => {
    setExpandedStatus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }

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

  
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Menu Hambúrguer - Só quando sidebar está fechada */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-all duration-200 hover-scale"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar Colapsável */}
      <div className={`fixed top-0 left-0 h-full shadow-lg z-40 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80`} style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="p-6 overflow-y-auto h-full relative">
          {/* Botão X para fechar sidebar */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-1 rounded transition-colors duration-200 hover-scale"
            style={{ color: '#FFFFFF' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#FFFFFF' }}>
            Categorias
          </h2>
          
          {/* Botão para criar nova categoria */}
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="w-full mb-4 px-4 py-2 rounded-md hover:scale-105 transition-transform btn-white"
          >
            + Nova Categoria
          </button>

          {/* Lista de Categorias */}
          <div className="space-y-2 mb-6">
            <button 
              className={`w-full text-left px-3 py-2 text-sm rounded-md border ${
                selectedCategory === '' 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory('')}
            >
              Todas as Categorias
            </button>
            
            {categories.map((category) => {
              const categoryEvents = getEventsByCategory(category.id)
              const isExpanded = expandedCategories.has(category.id)
              
              return (
                <div key={category.id} className="border rounded-md overflow-hidden transition-all duration-300">
                  <div className="flex items-center">
                    <button
                      className={`flex-1 text-left px-3 py-2 text-sm rounded-md border-0 ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        toggleCategoryExpansion(category.id)
                      }}
                    >
                  <div className="flex items-center justify-between w-full">

                    {/* ESQUERDA */}
                    <div className="flex items-center space-x-2">
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>

                      <span>{category.Name}</span>
                      <span className="text-xs text-gray-500">({categoryEvents.length})</span>
                    </div>

                    {/* DIREITA */}
                    <div className="flex items-center gap-2">

                      {/* Ícones (vinho sólido) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditCategory(category)
                        }}
                        className="p-1 rounded transition hover:bg-gray-100"
                        style={{ color: '#5F0000' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCategoryClick(category.id)
                        }}
                        className="p-1 rounded transition hover:bg-gray-100"
                        style={{ color: '#5F0000' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Bolinha de cor (colada na direita) */}
                      <div 
                        className="w-3 h-3 rounded-full ml-2"
                        style={{ backgroundColor: category.Color }}
                      />

                    </div>
                  </div>
                    </button>
                  </div>
                  
                  {/* Tarefas da Categoria (Expandido) */}
                  <div className={`bg-gray-50 border-t border-gray-200 transition-all duration-300 ${
                    isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-0 overflow-hidden'
                  }`}>
                    {categoryEvents.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 italic">
                        Nenhuma tarefa nesta categoria
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {categoryEvents.map((event) => (
                          <div
                            key={event.id}
                            className="px-3 py-2 text-xs bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            onClick={() => handleTaskClick(event)}
                          >
                            <div className="font-medium text-gray-800">{event.title}</div>
                            <div className="text-gray-500">
                              {new Date(event.start).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Seção de Status */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
              Status das Tarefas
            </h3>
            
            <div className="space-y-3">
              {Object.entries(getEventsByStatus()).map(([status, statusEvents]) => {
                const statusLabels = {
                  nao_iniciado: 'Não Iniciado',
                  em_andamento: 'Em Andamento',
                  concluido: 'Concluído'
                }
                const statusColors = {
                  nao_iniciado: '#8B0000',
                  em_andamento: '#D4A574',
                  concluido: '#09E309'
                }
                
                return (
                  <div key={status} className="space-y-2">
                    <div 
                      className="flex items-center justify-between cursor-pointer transition-colors duration-200 hover-scale"
                      onClick={() => toggleStatus(status)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${
                            expandedStatus.has(status) ? 'rotate-90' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                        />
                        <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                          {statusLabels[status as keyof typeof statusLabels]}
                        </span>
                        <span className="text-xs text-gray-500">({statusEvents.length})</span>
                      </div>
                    </div>
                    
                    {statusEvents.length > 0 && (
                      <div className={`space-y-1 pl-5 transition-all duration-300 ${
                        expandedStatus.has(status) ? 'max-h-96 overflow-y-auto' : 'max-h-0 overflow-hidden'
                      }`}>
                        {statusEvents.map((event) => (
                          <div
                            key={event.id}
                            className="px-2 py-1 text-xs bg-white rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            onClick={() => handleTaskClick(event)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate flex-1">{event.title}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {event.start && event.end ? 
                                  `${new Date(event.start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${new Date(event.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(event.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}` 
                                  : ''
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar sidebar em mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Conteúdo Principal - Calendário */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
        <Navbar />
        
        <div className="flex-1 p-2 overflow-auto">
          <div className="h-full p-2 pb-4">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Calendário de Tarefas
            </h1>
            
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={ptBr}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              dateClick={(info) => {
                // Ao clicar no dia, navegar para view diária
                const calendarApi = info.view.calendar;
                calendarApi.changeView('timeGridDay', info.dateStr);
              }}
              eventClick={handleEventClick}
              eventContent={(eventInfo) => {
                const status = eventInfo.event.extendedProps?.status || 'nao_iniciado'
                const title = eventInfo.event.title
                const viewType = eventInfo.view.type
                const statusColor = eventInfo.event.extendedProps?.statusColor || '#5F0000'
                
                // Mapeamento para exibir status formatado
                const statusLabels: Record<string, string> = {
                  'nao_iniciado': 'Não Iniciado',
                  'em_andamento': 'Em Andamento',
                  'concluido': 'Concluído'
                }
                const statusLabel = statusLabels[status] || status
                
                // Mostrar status apenas em semana e dia
                if (viewType === 'timeGridWeek' || viewType === 'timeGridDay') {
                  return (
                    <div className="fc-event-main p-1">
                      <div className="fc-event-title font-medium">{title}</div>
                      <div className="flex items-center mt-1">
                        <div 
                          className="w-1.5 h-1.5 rounded-full mr-1" 
                          style={{ backgroundColor: statusColor }}
                        />
                        <span className="text-xs opacity-90">{statusLabel}</span>
                      </div>
                    </div>
                  )
                }
                
                // View mensal - mostra apenas título
                return (
                  <div className="fc-event-main">
                    <div className="fc-event-title">{title}</div>
                  </div>
                )
              }}
              editable={true}
              selectable={true}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="23:15:00"
              slotDuration="00:15:00"
              slotLabelInterval="00:15:00"
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              allDaySlot={false}
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
              }}
                            views={{
                dayGridMonth: {
                  titleFormat: { year: 'numeric', month: 'long' }
                },
                timeGridWeek: {
                  titleFormat: { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                  }
                },
                timeGridDay: {
                  titleFormat: { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                  }
                }
              }}
              dayHeaderContent={(args) => {
                const view = args.view.type;
                const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
                
                // Aplicar nas views semanal e diária
                if (view === 'timeGridWeek' || view === 'timeGridDay') {
                  return (
                    <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
                      <div style={{ fontSize: 11, fontWeight: 400, color: '#9b7b8a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {dias[args.date.getDay()]}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#4a1535' }}>
                        {args.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  );
                }
                // Para view mensal, mostrar apenas o dia da semana
                if (view === 'dayGridMonth') {
                  return (
                    <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600 }}>
                      {dias[args.date.getDay()]}
                    </div>
                  );
                }
                return null;
              }}
              windowResizeDelay={100}
            />
          </div>
          
          {/* Botão flutuante para criar tarefa */}
          <button
            onClick={() => {
              setSelectedDate(null)
              setSelectedEvent(null)
              setShowModal(true)
            }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover-scale z-40 flex items-center justify-center"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF'
            }}
            title="Criar Nova Tarefa"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategoryCreated={handleCategoryCreated}
        />
      )}

      {showEditCategoryModal && editingCategory && (
        <CategoryModal
          isOpen={showEditCategoryModal}
          onClose={() => {
            setShowEditCategoryModal(false)
            setEditingCategory(null)
          }}
          onCategoryCreated={handleUpdateCategory}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md mx-4 rounded-lg shadow-xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Confirmar Exclusão
            </h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false)
                  setCategoryToDelete('')
                }}
                className="px-4 py-2 rounded-md transition-colors hover-scale"
                style={{ 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="px-4 py-2 rounded-md transition-colors hover-scale btn-wine"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <EventModal
          event={selectedEvent}
          selectedDate={selectedDate}
          onClose={() => {
            setShowModal(false)
            setSelectedEvent(null)
            setSelectedDate(null)
            fetchEvents()
            // Forçar atualização do calendário
            setTimeout(() => {
              const calendarApi = calendarRef.current?.getApi()
              if (calendarApi) {
                calendarApi.refetchEvents()
              }
            }, 100)
          }}
          onSave={handleSaveEvent}
          onDelete={selectedEvent?.id ? () => handleDeleteEvent(selectedEvent?.id!) : undefined}
        />
      )}
    </div>
  )
}
