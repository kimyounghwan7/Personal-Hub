import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<ValueType extends string> {
  value: ValueType;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedToggleProps<ValueType extends string> {
  options: readonly SegmentOption<ValueType>[];
  value: ValueType;
  onChange: (nextValue: ValueType) => void;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export function SegmentedToggle<ValueType extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  disabled = false,
}: SegmentedToggleProps<ValueType>) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex items-center rounded-lg bg-[#f2f4f6] p-1 border border-[#e5e8eb]',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all select-none',
              size === 'sm'
                ? 'px-2 py-1 text-xs'
                : 'px-2.5 py-1 text-xs sm:text-sm',
              isSelected
                ? 'bg-[#18865b] text-white shadow-sm font-semibold'
                : 'text-[#4e5968] hover:text-[#191f28] hover:bg-black/5',
            )}
          >
            {option.icon ? (
              <span className="shrink-0" aria-hidden="true">
                {option.icon}
              </span>
            ) : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
