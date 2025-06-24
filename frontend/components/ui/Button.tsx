// frontend/components/ui/Button.tsx
import { ReactNode, ButtonHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    ghost: 'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500',
  }

  const sizes = {
    default: 'py-2 px-4',
    sm: 'py-1 px-2 text-sm',
    lg: 'py-3 px-8',
  }

  return (
    <button
      className={classNames(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
