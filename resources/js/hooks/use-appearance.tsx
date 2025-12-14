import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

export function initializeTheme() {
    const savedAppearance =
        (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);
}

interface AppearanceContextType {
    appearance: Appearance;
    updateAppearance: (mode: Appearance) => void;
    resolvedTheme: ResolvedTheme;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(
    undefined,
);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);

        // Update resolved theme
        if (mode === 'system') {
            setResolvedTheme(prefersDark() ? 'dark' : 'light');
        } else {
            setResolvedTheme(mode);
        }
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem(
            'appearance',
        ) as Appearance | null;
        updateAppearance(savedAppearance || 'system');

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            // Only update if we are in system mode
            const currentAppearance = localStorage.getItem(
                'appearance',
            ) as Appearance;
            if (currentAppearance === 'system' || !currentAppearance) {
                applyTheme('system');
                setResolvedTheme(e.matches ? 'dark' : 'light');
            }
        };

        const mq = mediaQuery();
        mq?.addEventListener('change', handleSystemThemeChange);

        return () => mq?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return (
        <AppearanceContext.Provider
            value={{ appearance, updateAppearance, resolvedTheme }}
        >
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (!context) {
        throw new Error('useAppearance must be used within a ThemeProvider');
    }
    return context;
}
