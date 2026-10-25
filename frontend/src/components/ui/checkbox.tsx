"use client";

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-5 w-5 shrink-0 rounded-md border border-emerald-200/25 bg-white/[0.04] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ee3be]/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[#8ee3be] data-[state=checked]:bg-[#8ee3be] data-[state=checked]:text-[#062016] data-[state=checked]:shadow-[0_0_12px_rgba(142,227,190,0.4)]',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-3.5 w-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
