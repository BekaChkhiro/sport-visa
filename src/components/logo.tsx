import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'size-6', svg: 20 },
  md: { container: 'size-8', svg: 26 },
  lg: { container: 'size-11', svg: 36 },
};

export function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  const { container, svg } = sizes[size];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* Mark: rounded square with football motif */}
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-[10px] bg-brand-400 shadow-card',
          container,
        )}
      >
        <svg
          width={svg * 0.72}
          height={svg * 0.72}
          viewBox="0 0 20 20"
          fill="none"
          focusable="false"
        >
          {/* Outer circle */}
          <circle cx="10" cy="10" r="9" stroke="#1f2a0b" strokeWidth="1.5" />
          {/* Centre pentagon */}
          <polygon
            points="10,4.5 12.6,6.5 11.6,9.5 8.4,9.5 7.4,6.5"
            stroke="#1f2a0b"
            strokeWidth="1.2"
            strokeLinejoin="round"
            fill="#1f2a0b"
            fillOpacity="0.25"
          />
          {/* Spokes */}
          <line
            x1="10"
            y1="4.5"
            x2="10"
            y2="1"
            stroke="#1f2a0b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="12.6"
            y1="6.5"
            x2="16"
            y2="4.5"
            stroke="#1f2a0b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="11.6"
            y1="9.5"
            x2="14.5"
            y2="12.5"
            stroke="#1f2a0b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="8.4"
            y1="9.5"
            x2="5.5"
            y2="12.5"
            stroke="#1f2a0b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="7.4"
            y1="6.5"
            x2="4"
            y2="4.5"
            stroke="#1f2a0b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-bold tracking-tight leading-none text-ink-50">
          Sport<span className="text-brand-400"> Visa</span>
        </span>
      )}
    </span>
  );
}
