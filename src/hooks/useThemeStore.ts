import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('olitrack_theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return 'light'; // Default is light mode
};

const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('olitrack_theme', nextTheme);
      applyTheme(nextTheme);
      return { theme: nextTheme };
    });
  },
  setTheme: (theme: Theme) => {
    localStorage.setItem('olitrack_theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));
