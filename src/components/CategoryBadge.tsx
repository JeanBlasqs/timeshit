import type { Category } from '../types'

interface CategoryBadgeProps {
  category?: Category | null
  color?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CategoryBadge({ category, color, name, size = 'md' }: CategoryBadgeProps) {
  const badgeColor = category?.Color || color || '#6b7280'
  const displayName = category?.Name || name || 'Sem categoria'

  const sizeClasses = {
    sm: 'w-2 h-2 text-xs',
    md: 'w-3 h-3 text-sm',
    lg: 'w-4 h-4 text-base'
  }

  return (
    <div className="flex items-center space-x-2">
      <div 
        className={`rounded-full ${sizeClasses[size]}`}
        style={{ backgroundColor: badgeColor }}
      />
      <span className="text-gray-700 font-medium">{displayName}</span>
    </div>
  )
}
