import * as React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';

export function ThemeToggle() {
  const { appearance, updateAppearance } = useAppearance();

  const cycleTheme = () => {
    const themeOrder: Appearance[] = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(appearance);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    updateAppearance(themeOrder[nextIndex]);
  };

  const getIcon = () => {
    switch (appearance) {
      case 'dark':
        return <Moon size={16} />;
      case 'light':
        return <Sun size={16} />;
      case 'system':
        return <Monitor size={16} />;
      default:
        return <Sun size={16} />;
    }
  };

  const getLabel = () => {
    switch (appearance) {
      case 'dark':
        return 'Dark mode';
      case 'light':
        return 'Light mode';
      case 'system':
        return 'System theme';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${appearance === 'dark'
          ? 'bg-zinc-900'
          : appearance === 'light'
            ? 'bg-zinc-100'
            : 'bg-gradient-to-r from-zinc-100 to-zinc-900'
        }`}
    >
      <span
        className={`absolute top-1 left-1 flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200 ${appearance === 'dark'
            ? 'translate-x-5 bg-black'
            : appearance === 'light'
              ? 'translate-x-0 bg-white'
              : 'translate-x-2.5 bg-zinc-500'
          }`}
      >
        {getIcon()}
      </span>
    </button>
  );
}
