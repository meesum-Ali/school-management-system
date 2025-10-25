'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email?: string
  username?: string
  name?: string
  roles: string[]
}

const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check auth status from server
    fetch('/_api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error('Not authenticated')
      })
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true)
          setUser(data.user)
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <header className='bg-white shadow-md p-4 flex justify-between items-center'>
      <div className='text-xl font-bold'>
        <Link href='/'>School Management System</Link>
      </div>
      <nav>
        {loading ? (
          <span className='text-gray-500'>Loading...</span>
        ) : isAuthenticated && user ? (
          <div className='flex items-center space-x-4'>
            <span className='text-gray-700'>
              Welcome, {user.name || user.username || user.email}
            </span>
            <a
              href='/auth/logout'
              className='text-red-500 hover:text-red-700 font-medium'
            >
              Logout
            </a>
          </div>
        ) : (
          <Link href='/' className='text-blue-500 hover:text-blue-700'>
            Login
          </Link>
        )}
      </nav>
    </header>
  )
}

export default Navbar
