import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'

interface NotificationProps {
  message: string
  type: 'success' | 'error'
  onClose?: () => void
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
}) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div
      className={`${bgColor} text-white p-4 rounded mb-4 flex justify-between items-center`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className='ml-4 text-white hover:text-gray-200 focus:outline-none'
          aria-label='Close notification'
        >
          <XMarkIcon className='h-5 w-5' />
        </button>
      )}
    </div>
  )
}

export default Notification
