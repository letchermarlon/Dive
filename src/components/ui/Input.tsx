import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const baseClass = 'w-full bg-ocean-900 border border-ocean-700 rounded-lg px-3 py-2 text-ocean-100 placeholder-ocean-500 focus:outline-none focus:border-ocean-400 transition-colors'

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-ocean-300">{label}</label>}
      <input className={`${baseClass} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-ocean-300">{label}</label>}
      <textarea className={`${baseClass} resize-none ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
