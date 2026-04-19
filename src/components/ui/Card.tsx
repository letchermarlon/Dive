import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
}

export default function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-ocean-900 border border-ocean-700 rounded-xl p-4 ${className}`} {...props}>
      {title && <h3 className="text-ocean-200 font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  )
}
