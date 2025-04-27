import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils' // Asegurate de tener esta función o usa className directamente

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
