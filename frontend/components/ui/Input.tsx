// frontend/components/ui/Input.tsx

import { ReactNode, InputHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = ({ icon, rightIcon, className, ...props }: InputProps) => (
  <div className='relative'>
    {icon && (
      <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
        {icon}
      </span>
    )}
    <input
      className={classNames(
        'w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200',
        className,
      )}
      {...props}
    />
    {rightIcon && (
      <span className='absolute right-3 top-1/2 transform -translate-y-1/2'>
        {rightIcon}
      </span>
    )}
  </div>
)
