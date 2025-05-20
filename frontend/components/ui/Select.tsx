import { ReactNode, SelectHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
  className?: string
}

export const Select = ({ children, className, ...props }: SelectProps) => (
  <select
    className={classNames(
      'w-full border border-gray-300 dark:border-gray-600 rounded-md py-3 px-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200',
      className,
    )}
    {...props}
  >
    {children}
  </select>
)
