import { useEffect } from 'react';

export function AnimatedScrollbar() {
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        const root = document.documentElement;
        const className = 'animated-scrollbar';

        if (!root.classList.contains(className)) {
            root.classList.add(className);
        }

        return () => {
            root.classList.remove(className);
        };
    }, []);

    return null;
}
