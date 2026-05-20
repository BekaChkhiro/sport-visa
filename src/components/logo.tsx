import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { width: 20, height: 24 },
  md: { width: 26, height: 30 },
  lg: { width: 36, height: 42 },
};

export function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  const { width, height } = sizes[size];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 28"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {/* Shield badge */}
        <path
          d="M12 0.5L1 4.5V17.5C1 23.5 6.5 26.5 12 27.5C17.5 26.5 23 23.5 23 17.5V4.5L12 0.5Z"
          className="fill-primary"
        />
        {/* V-mark: victory / visa */}
        <path
          d="M7.5 12L12 20L16.5 12"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="font-semibold tracking-tight leading-none">Sport Visa</span>
      )}
    </span>
  );
}
