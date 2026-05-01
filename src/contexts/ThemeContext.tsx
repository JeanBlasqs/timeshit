import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeColors {
  primary: string
  primaryRgb: string
  secondary: string
  secondaryRgb: string
  text: string
  textSecondary: string
  background: string
  surface: string
  border: string
  hover: string
}

const themes: Record<Theme, ThemeColors> = {
  dark: {
    primary: '#4b0f1c', // vinho escuro
    primaryRgb: 'rgb(75, 15, 28)',
    secondary: '#f4f4f5', // texto principal
    secondaryRgb: 'rgb(244, 244, 245)',
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    background: '#0f0f11',
    surface: '#1f1f23',
    border: '#2a2a2e',
    hover: '#7a1f2c'
  },
  light: {
    primary: '#5F0000', // vinho como principal (navbar)
    primaryRgb: 'rgb(95, 0, 0)',
    secondary: '#EBE9B7', // bege como secundário
    secondaryRgb: 'rgb(235, 233, 183)',
    text: '#5F0000', // texto vinho para elementos no fundo branco
    textSecondary: '#333333', // cinza escuro
    background: '#FFFFFF', // fundo branco puro
    surface: '#FFFFFF', // superfície branca
    border: '#E5E5E5', // bordas cinza claro
    hover: '#F5F5F5' // hover cinza muito claro
  }
}

interface ThemeContextType {
  theme: Theme
  colors: ThemeColors
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Carregar tema do localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Salvar tema no localStorage
    localStorage.setItem('theme', theme)
    
    // Aplicar variáveis CSS ao documento
    const colors = themes[theme]
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-rgb', colors.primaryRgb)
    root.style.setProperty('--color-secondary', colors.secondary)
    root.style.setProperty('--color-secondary-rgb', colors.secondaryRgb)
    root.style.setProperty('--color-text', colors.text)
    root.style.setProperty('--color-text-secondary', colors.textSecondary)
    root.style.setProperty('--color-background', colors.background)
    root.style.setProperty('--color-surface', colors.surface)
    root.style.setProperty('--color-border', colors.border)
    root.style.setProperty('--color-hover', colors.hover)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      colors: themes[theme],
      toggleTheme,
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
