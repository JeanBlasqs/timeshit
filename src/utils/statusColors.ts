const statusColors: Record<string, string> = {
  nao_iniciado: '#8B0000', // vinho mais escuro
  em_andamento: '#D4A574', // bege/marrom médio
  concluido: '#C8B88B', // bege claro
}

export const getStatusColor = (status: string): string => {
  return statusColors[status] || '#5F0000' // vinho padrão
}

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'nao_iniciado':
      return 'Não Iniciado'
    case 'em_andamento':
      return 'Em Andamento'
    case 'concluido':
      return 'Concluído'
    default:
      return 'Não Iniciado'
  }
}
