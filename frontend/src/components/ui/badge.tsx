import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
  {
    variants: {
      variant: {
        default:
          'border-[#b6e2cf] bg-[#e6f4ee] text-[#126b48]',
        secondary:
          'border-slate-200 bg-slate-100 text-slate-700',
        success:
          'border-[#b6e2cf] bg-[#e6f4ee] text-[#126b48]',
        warning:
          'border-amber-200 bg-amber-50 text-amber-700',
        destructive:
          'border-rose-200 bg-rose-50 text-rose-600 font-semibold',
        outline:
          'border-slate-200 bg-white text-slate-700',
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
