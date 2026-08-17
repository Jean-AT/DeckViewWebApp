import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'

function applyTheme(light: boolean) {
  document.documentElement.classList.toggle('light', light)
  localStorage.setItem('dv_theme', light ? 'light' : 'dark')
}

export function ThemeToggle() {
  const [light, setLight] = useState(() => localStorage.getItem('dv_theme') === 'light')

  useEffect(() => {
    applyTheme(light)
  }, [light])

  return (
    <Button aria-label="Toggle theme" size="icon" variant="ghost" onClick={() => setLight((value) => !value)}>
      {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  )
}
