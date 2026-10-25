import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
  {
    variants: {
      variant: {
        default:
          'border-[#8ee3be]/35 bg-[#8ee3be]/12 text-[#b9f5d8]',
        secondary:
          'border-teal-300/30 bg-teal-300/12 text-teal-200',
        success:
          'border-[#8ee3be]/40 bg-[#8ee3be]/15 text-[#bbf7d0]',
        warning:
          'border-amber-300/35 bg-amber-400/12 text-amber-200',
        destructive:
          'border-rose-400/35 bg-rose-500/12 text-rose-200',
        outline:
          'border-emerald-200/15 bg-white/[0.04] text-emerald-100/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
