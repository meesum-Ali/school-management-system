// frontend/components/ui/Card.tsx

import { ReactNode } from 'react'
import { classNames } from '../../utils/classNames'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={classNames('bg-white shadow-lg rounded-lg p-8', className)}>
    {children}
  </div>
)
