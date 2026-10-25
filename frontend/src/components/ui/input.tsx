import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-[#e5e8eb] bg-white px-3.5 py-1.5 text-sm text-[#191f28] placeholder:text-[#8b95a1] transition-all focus-visible:outline-none focus-visible:border-[#18865b] focus-visible:ring-2 focus-visible:ring-[#18865b]/15 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
