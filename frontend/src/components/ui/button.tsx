import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ee3be]/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#8ee3be] via-[#9be7c6] to-[#7ddbc5] text-[#062016] shadow-[0_0_24px_rgba(142,227,190,0.28)] hover:brightness-105 hover:shadow-[0_0_32px_rgba(142,227,190,0.42)]',
        destructive:
          'bg-rose-500/15 text-rose-300 border border-rose-400/25 hover:bg-rose-500/25 hover:border-rose-400/40',
        outline:
          'border border-emerald-200/15 bg-emerald-950/20 text-emerald-50 hover:bg-[#8ee3be]/10 hover:border-[#8ee3be]/35 hover:text-[#bbf7d0] backdrop-blur-md',
        secondary:
          'border border-[#8ee3be]/25 bg-[#8ee3be]/12 text-[#a7f3d0] hover:bg-[#8ee3be]/20',
        ghost:
          'text-emerald-100/75 hover:bg-[#8ee3be]/10 hover:text-[#bbf7d0]',
        link:
          'text-[#8ee3be] underline-offset-4 hover:underline hover:text-[#bbf7d0]',
        success:
          'bg-[#8ee3be]/15 text-[#a7f3d0] border border-[#8ee3be]/35 hover:bg-[#8ee3be]/25',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-full px-8 text-base',
        icon: 'h-9 w-9',
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
