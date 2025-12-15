import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useChatContext } from '@/contexts/chat-context';
import { SharedData, User } from '@/types';

/**
 * This component syncs the authenticated user from Inertia's page props
 * to the global ChatContext. It should be rendered inside the Inertia App tree
 * (e.g., in AppSidebarLayout) so it has access to usePage().
 */
export function AuthSync() {
    const { auth } = usePage<SharedData>().props;
    const { setUser } = useChatContext();
    const prevUserRef = useRef<User | null | undefined>(undefined);

    useEffect(() => {
        // Only update context if user actually changed (deep comparison not needed for simple identity check)
        const currentUser = auth.user || null;
        
        // Initial set or change
        if (prevUserRef.current === undefined || prevUserRef.current?.id !== currentUser?.id) {
            setUser(currentUser);
            prevUserRef.current = currentUser;
        }
    }, [auth.user, setUser]);

    return null; // This component renders nothing
}
