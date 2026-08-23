import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [light, setLight] = useState(() => document.documentElement.classList.contains('light'))

  useEffect(() => {
    document.documentElement.classList.toggle('light', light)
    try {
      if (light) localStorage.setItem('dv_theme', 'light')
      else localStorage.removeItem('dv_theme')
    } catch {
      // storage no disponible
    }
  }, [light])

  return (
    <button
      onClick={() => setLight((v) => !v)}
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
      title={light ? 'Switch to dark theme' : 'Switch to light theme'}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted-foreground transition-colors hover:bg-accent-surface/10 hover:text-foreground"
    >
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  )
}