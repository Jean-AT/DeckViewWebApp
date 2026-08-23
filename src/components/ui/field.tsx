import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const FIELD_CLASSES =
  'w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:pointer-events-none disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(FIELD_CLASSES, 'h-10', className)} {...props} />,
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(FIELD_CLASSES, 'min-h-24 py-2 font-mono text-xs', className)} {...props} />
  ),
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(FIELD_CLASSES, 'h-10 appearance-none bg-card', className)} {...props}>
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

export function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  )
}