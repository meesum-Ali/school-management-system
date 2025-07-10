// frontend/pages/login.tsx

import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom' // Changed import
import { AuthContext } from '../contexts/AuthContext'
import { UserIcon, LockClosedIcon, BuildingOffice2Icon } from '@heroicons/react/24/solid' // Added BuildingOffice2Icon
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { PasswordToggle } from '../components/ui/PasswordToggle'

const LoginPage: React.FC = () => {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate() // Changed hook

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [schoolIdentifier, setSchoolIdentifier] = useState('') // New state for school identifier
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Pass schoolIdentifier to login function. It's optional.
      await login(username, password, schoolIdentifier || undefined)
      navigate('/admin/dashboard') // Changed to navigate
    } catch (err) {
      console.error(err)
      setError('Invalid credentials')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300'>
      <Card className='w-full max-w-md mx-auto dark:bg-gray-800'>
        <h2 className='text-3xl font-semibold text-center text-gray-800 dark:text-white mb-6'>
          Welcome Back
        </h2>

        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Username Input */}
          <div>
            <label htmlFor='username' className='sr-only'>
              Username
            </label>
            <Input
              icon={<UserIcon className='h-5 w-5' />}
              type='text'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Username'
              required
              aria-label='Username'
            />
          </div>

          {/* School Identifier Input (Optional) */}
          <div>
            <label htmlFor='schoolIdentifier' className='sr-only'>
              School Identifier (Optional)
            </label>
            <Input
              icon={<BuildingOffice2Icon className='h-5 w-5' />}
              type='text'
              id='schoolIdentifier'
              value={schoolIdentifier}
              onChange={(e) => setSchoolIdentifier(e.target.value)}
              placeholder='School Code/Domain (Optional)'
              aria-label='School Identifier'
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor='password' className='sr-only'>
              Password
            </label>
            <Input
              icon={<LockClosedIcon className='h-5 w-5' />}
              type={showPassword ? 'text' : 'password'}
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              required
              aria-label='Password'
              rightIcon={
                <PasswordToggle
                  show={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                />
              }
            />
          </div>

          {/* Submit Button */}
          <Button type='submit'>Login</Button>
        </form>

        {/* Additional Links */}
        <p className='text-center text-gray-600 dark:text-gray-400 mt-4'>
          Don&apos;t have an account?{' '}
          <Link
            to='/register' // Changed to Link and to prop
            className='text-blue-600 dark:text-blue-400 hover:underline'
          >
            Register here
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
