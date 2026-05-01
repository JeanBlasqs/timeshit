export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'nao_iniciado':
      return '#8B0000' // vinho mais escuro
    case 'em_andamento':
      return '#D4A574' // bege/marrom médio
    case 'concluido':
      return '#C8B88B' // bege claro
    default:
      return '#5F0000' // vinho padrão
  }
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
