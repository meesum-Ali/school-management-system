import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const UnauthorizedPage: React.FC = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300'>
      <Card className='w-full max-w-md mx-auto text-center dark:bg-gray-800'>
        <h1 className='text-3xl font-semibold text-gray-800 dark:text-white mb-4'>
          Access Denied
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mb-6'>
          You do not have permission to view this page.
        </p>
        <Button component={Link} to='/login' className='w-auto px-4 py-2'>
          Go to Login
        </Button>
      </Card>
    </div>
  )
}

export default UnauthorizedPage
