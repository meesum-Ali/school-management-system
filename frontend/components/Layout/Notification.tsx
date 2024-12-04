import React from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error'
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'
  return (
    <div className={`${bgColor} text-white p-4 rounded mb-4`}>{message}</div>
  )
}

export default Notification
