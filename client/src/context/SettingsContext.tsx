import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserPreferences } from "@shared/schema";

type SettingsContextType = {
  // We can expose settings here if needed, but mostly this component handles side-effects
  isCompactMode: boolean;
  fontSize: string;
  accentColor: string;
};

const SettingsContext = createContext<SettingsContextType>({
  isCompactMode: false,
  fontSize: "medium",
  accentColor: "purple",
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const prefs = (user?.preferences ?? {}) as Partial<UserPreferences>;
  
  const isCompactMode = prefs.compactMode ?? false;
  const fontSize = prefs.fontSize ?? "medium";
  const accentColor = prefs.accentColor ?? "purple";
  // darkMode is forced to true for Nocturne theme as per product design, but we can respect it if we ever add a light theme
  
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'small') root.classList.add('text-sm');
    else if (fontSize === 'large') root.classList.add('text-lg');
    else root.classList.add('text-base');

    // Apply compact mode
    if (isCompactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Apply Accent Color via CSS variables (Tailwind Primary)
    // We map the setting options to HSL values for Tailwind
    const accentColors: Record<string, string> = {
      purple: '262.1 83.3% 57.8%',
      indigo: '239 84% 67%',
      blue: '217.2 91.2% 59.8%',
      rose: '346.8 77.2% 49.8%',
      emerald: '142.1 76.2% 36.3%',
    };

    if (accentColors[accentColor]) {
      root.style.setProperty('--primary', accentColors[accentColor]);
    } else {
      // default purple
      root.style.setProperty('--primary', '262.1 83.3% 57.8%');
    }

  }, [isCompactMode, fontSize, accentColor]);

  return (
    <SettingsContext.Provider value={{ isCompactMode, fontSize, accentColor }}>
      {children}
    </SettingsContext.Provider>
  );
}
