import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeId =
  | 'cherry-red'
  | 'navy-blue'
  | 'teal-green'
  | 'rose'
  | 'forest-green'
  | 'orange';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
  preview: { sidebar: string; accent: string; bg: string };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'cherry-red',
    label: 'Cherry Red',
    description: 'Cherry Red & Half White',
    preview: { sidebar: '#160208', accent: '#dc143c', bg: '#fff5f6' },
  },
  {
    id: 'navy-blue',
    label: 'Navy Blue',
    description: 'White & Navy Blue',
    preview: { sidebar: '#0a0f2e', accent: '#1e40af', bg: '#f0f4ff' },
  },
  {
    id: 'teal-green',
    label: 'Teal Green',
    description: 'Teal Green & White',
    preview: { sidebar: '#021a17', accent: '#0f766e', bg: '#f0fdfb' },
  },
  {
    id: 'rose',
    label: 'Rose',
    description: 'Rose & Half White',
    preview: { sidebar: '#1a0516', accent: '#e11d91', bg: '#fff0f8' },
  },
  {
    id: 'forest-green',
    label: 'Forest Green',
    description: 'Green & Half White',
    preview: { sidebar: '#031a08', accent: '#16a34a', bg: '#f0fdf4' },
  },
  {
    id: 'orange',
    label: 'Orange',
    description: 'Orange & Half White',
    preview: { sidebar: '#1a0c02', accent: '#ea580c', bg: '#fff8f0' },
  },
];

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: 'cherry-red',
  theme: THEMES[0],
  setTheme: () => {},
  themes: THEMES,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('hms-theme') as ThemeId) || 'cherry-red';
  });

  const applyTheme = useCallback((id: ThemeId) => {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem('hms-theme', id);
  }, []);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId, applyTheme]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
  }, []);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
