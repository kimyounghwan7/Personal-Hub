import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18865b]/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]',
  {
    variants: {
      variant: {
        default:
          'bg-[#18865b] text-white shadow-sm hover:bg-[#136c49]',
        destructive:
          'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm',
        secondary:
          'border border-[#b6e2cf] bg-[#e6f4ee] text-[#126b48] hover:bg-[#d6ede3]',
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        link:
          'text-[#18865b] underline-offset-4 hover:underline hover:text-[#136c49]',
        success:
          'border border-[#b6e2cf] bg-[#e6f4ee] text-[#126b48] hover:bg-[#d6ede3]',
      },
      size: {
        default: 'h-9 px-4 text-xs sm:text-sm rounded-lg',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-11 px-6 text-sm rounded-xl',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
