import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('vercia.theme') !== 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('vercia.theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setDark(!dark)}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
