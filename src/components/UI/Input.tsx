import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-zinc-300">{label}</label>}
      <input
        ref={ref}
        className={`
          bg-zinc-800 border rounded-lg px-3 py-2 text-zinc-100
          placeholder:text-zinc-600 outline-none transition-all
          focus:ring-2 focus:ring-violet-500 focus:border-violet-500
          ${error ? 'border-red-500' : 'border-zinc-700'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
);

Input.displayName = 'Input';