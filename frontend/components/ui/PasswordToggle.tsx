// frontend/components/ui/PasswordToggle.tsx

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'

interface PasswordToggleProps {
  show: boolean
  onToggle: () => void
}

export const PasswordToggle = ({ show, onToggle }: PasswordToggleProps) => (
  <button
    type='button'
    onClick={onToggle}
    className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none'
    aria-label={show ? 'Hide password' : 'Show password'}
  >
    {show ? (
      <EyeSlashIcon className='h-5 w-5' />
    ) : (
      <EyeIcon className='h-5 w-5' />
    )}
  </button>
)
