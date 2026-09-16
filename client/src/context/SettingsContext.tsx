import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { UserPreferences } from "@shared/schema";

type SettingsContextType = {
  // We can expose settings here if needed, but mostly this component handles side-effects
  isCompactMode: boolean;
  fontSize: string;
  accentColor: string;
  backgroundTheme: string;
  customBackgroundUrl: string;
  fontFamily: string;
  uiRadius: string;
  glassmorphism: string;
  animationIntensity: string;
  setLocalPreview: (theme: string, url: string) => void;
};

const SettingsContext = createContext<SettingsContextType>({
  isCompactMode: false,
  fontSize: "medium",
  accentColor: "purple",
  backgroundTheme: "rainy-jungle",
  customBackgroundUrl: "",
  fontFamily: "sans",
  uiRadius: "rounded",
  glassmorphism: "frosted",
  animationIntensity: "standard",
  setLocalPreview: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const prefs = (user?.preferences ?? {}) as Partial<UserPreferences>;
  
  const [localTheme, setLocalTheme] = React.useState<string | null>(null);
  const [localUrl, setLocalUrl] = React.useState<string | null>(null);
  
  const isCompactMode = prefs.compactMode ?? false;
  const fontSize = prefs.fontSize ?? "medium";
  const accentColor = prefs.accentColor ?? "purple";
  const backgroundTheme = localTheme ?? prefs.backgroundTheme ?? "rainy-jungle";
  const customBackgroundUrl = localUrl !== null ? localUrl : (prefs.customBackgroundUrl ?? "");
  const fontFamily = prefs.fontFamily ?? "sans";
  const uiRadius = prefs.uiRadius ?? "rounded";
  const glassmorphism = prefs.glassmorphism ?? "frosted";
  const animationIntensity = prefs.animationIntensity ?? "standard";

  const setLocalPreview = (theme: string, url: string) => {
    setLocalTheme(theme);
    setLocalUrl(url);
  };
  
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

    // Apply UI Radius
    if (uiRadius === 'sharp') root.style.setProperty('--ui-radius', '0px');
    else if (uiRadius === 'pill') root.style.setProperty('--ui-radius', '24px');
    else root.style.setProperty('--ui-radius', '12px');

    // Apply Glassmorphism (Card Opacity)
    if (glassmorphism === 'solid') {
      root.style.setProperty('--card-bg', 'rgba(10, 12, 20, 1)');
      root.style.setProperty('--card-bg-hover', 'rgba(18, 20, 30, 1)');
    } else if (glassmorphism === 'crystal') {
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.015)');
      root.style.setProperty('--card-bg-hover', 'rgba(255, 255, 255, 0.035)');
    } else {
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.045)');
      root.style.setProperty('--card-bg-hover', 'rgba(255, 255, 255, 0.065)');
    }

    // Apply Font Family
    if (fontFamily === 'serif') root.style.setProperty('--font-family', 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif');
    else if (fontFamily === 'mono') root.style.setProperty('--font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
    else if (fontFamily === 'dyslexic') root.style.setProperty('--font-family', 'Comic Sans MS, OpenDyslexic, sans-serif');
    else root.style.setProperty('--font-family', '"Inter", system-ui, sans-serif');

    // Apply Animation Intensity
    root.classList.remove('anim-minimal', 'anim-standard', 'anim-vibrant');
    root.classList.add(`anim-${animationIntensity}`);

  }, [isCompactMode, fontSize, accentColor, uiRadius, glassmorphism, fontFamily, animationIntensity]);

  return (
    <SettingsContext.Provider value={{ 
      isCompactMode, fontSize, accentColor, backgroundTheme, customBackgroundUrl,
      fontFamily, uiRadius, glassmorphism, animationIntensity, setLocalPreview
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
