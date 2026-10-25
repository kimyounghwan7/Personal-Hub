import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all select-none',
  {
    variants: {
      shape: {
        pill: 'rounded-full',
        rounded: 'rounded-lg',
      },
      size: {
        sm: 'text-xs px-2.5 py-0.5 gap-1.5 h-6',
        md: 'text-xs sm:text-sm px-3 py-1 gap-1.5 h-7 sm:h-8',
      },
    },
    defaultVariants: {
      shape: 'pill',
      size: 'md',
    },
  },
);

export type ChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'>,
    VariantProps<typeof chipVariants> {
  tone?: ChipTone;
  active?: boolean;
  dotColor?: string;
  count?: number;
  disabled?: boolean;
}

function resolveChipToneClass(tone: ChipTone, active: boolean | undefined): string {
  if (active === true) {
    if (tone === 'danger') {
      return 'bg-[#e5484d] text-white border border-[#e5484d] shadow-sm';
    }
    return 'bg-[#18865b] text-white border border-[#18865b] shadow-sm';
  }

  if (active === false) {
    return 'bg-white text-[#4e5968] border border-[#e5e8eb] hover:bg-[#f8fafc] hover:text-[#191f28] hover:border-[#d1d6db] cursor-pointer';
  }

  switch (tone) {
    case 'primary':
    case 'success':
      return 'bg-[#e6f4ee] text-[#126b48] border border-[#b6e2cf]';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'danger':
      return 'bg-[#fff0f0] text-[#e5484d] border border-[#f8c9c9] font-semibold';
    case 'neutral':
    default:
      return 'bg-[#f2f4f6] text-[#4e5968] border border-[#e5e8eb]';
  }
}

const Chip = React.forwardRef<HTMLElement, ChipProps>(
  (
    {
      className,
      tone = 'neutral',
      shape,
      size,
      active,
      dotColor,
      count,
      disabled = false,
      onClick,
      children,
      ...otherProps
    },
    forwardedRef,
  ) => {
    const isInteractive = active !== undefined || Boolean(onClick);
    const toneClassName = resolveChipToneClass(tone, active);

    const content = (
      <>
        {dotColor ? (
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
        ) : null}
        <span>{children}</span>
        {count !== undefined ? (
          <span
            className={cn(
              'ml-0.5 px-1.5 py-0.2 rounded-full text-[11px] font-semibold tabular-nums',
              active === true
                ? 'bg-white/25 text-white'
                : 'bg-black/5 text-inherit',
            )}
          >
            {count}
          </span>
        ) : null}
      </>
    );

    if (isInteractive) {
      return (
        <button
          ref={forwardedRef as React.ForwardedRef<HTMLButtonElement>}
          type="button"
          aria-pressed={active}
          disabled={disabled}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          className={cn(
            chipVariants({ shape, size }),
            toneClassName,
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
            className,
          )}
          {...(otherProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        ref={forwardedRef as React.ForwardedRef<HTMLSpanElement>}
        className={cn(chipVariants({ shape, size }), toneClassName, className)}
        {...(otherProps as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {content}
      </span>
    );
  },
);

Chip.displayName = 'Chip';

export { Chip, chipVariants };
