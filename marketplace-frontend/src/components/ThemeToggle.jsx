import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
    >
      {isDark ? (
        <Sun size={19} className="text-onLight/70" strokeWidth={1.75} />
      ) : (
        <Moon size={19} className="text-onLight/70" strokeWidth={1.75} />
      )}
    </button>
  )
}
