import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
})

const STORAGE_KEY = 'gravan_theme'
const DEFAULT_THEME = 'light'

function readInitialTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch (_) {}
  return DEFAULT_THEME
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme)

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (_) {}
  }, [theme])

  const setTheme = (t) => setThemeState(t === 'dark' ? 'dark' : 'light')
  const toggle = () => setThemeState(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
