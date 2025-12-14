import { cn } from '@/lib/utils';

export default function AppLogo({
    className,
    iconSrc = '/BlueTooth-logo.svg',
}: {
    className?: string;
    iconSrc?: string;
}) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <img src={iconSrc} alt="BlueTooth Logo" className="h-8 w-8" />
            <span
                className="text-lg text-foreground"
                style={{
                    fontFamily: 'Clash Display, sans-serif',
                    fontWeight: 600,
                }}
            >
                BlueTooth
            </span>
        </div>
    );
}
