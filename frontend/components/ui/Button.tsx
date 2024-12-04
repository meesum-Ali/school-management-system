// frontend/components/ui/Button.tsx
import { ReactNode, ButtonHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export const Button = ({ children, className, ...props }: ButtonProps) => (
  <button
    className={classNames(
      'w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition duration-200 transform hover:-translate-y-0.5',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
