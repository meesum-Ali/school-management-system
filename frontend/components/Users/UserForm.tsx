import React, { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useRouter } from 'next/router'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Notification from '../Layout/Notification'

interface UserFormProps {
  userId?: number
}

interface User {
  username: string
  email: string
  role: string
  password?: string
}

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup
    .string()
    .oneOf(['Admin', 'Teacher', 'Accountant', 'Student', 'Parent'])
    .required('Role is required'),
  password: yup.string().when(['userId'], (userId: string[], schema) => {
    return userId[0] ? schema : schema.required('Password is required')
  }),
})

const UserForm: React.FC<UserFormProps> = ({ userId }) => {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<User>({
    resolver: yupResolver(schema) as Resolver<User>,
    context: { userId },
  })

  useEffect(() => {
    if (userId) {
      api
        .get(`/users/${userId}`)
        .then((response) => {
          const { username, email, role } = response.data
          setValue('username', username)
          setValue('email', email)
          setValue('role', role)
        })
        .catch(() => {
          setError('Failed to fetch user data.')
        })
    }
  }, [userId, setValue])

  const onSubmit: SubmitHandler<User> = async (data) => {
    setError('')
    setSuccess('')
    try {
      if (userId) {
        await api.put(`/users/${userId}`, data)
        setSuccess('User updated successfully.')
        router.push('/admin/users')
      } else {
        await api.post('/users', data)
        setSuccess('User created successfully.')
        router.push('/admin/users')
      }
    } catch (err) {
      setError(err + 'An unexpected error occurred.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='bg-white p-6 rounded shadow-md w-full max-w-lg'
    >
      <h2 className='text-2xl mb-4'>{userId ? 'Edit User' : 'Add New User'}</h2>
      {error && <Notification message={error} type='error' />}
      {success && <Notification message={success} type='success' />}
      <div className='mb-4'>
        <label className='block mb-1'>Username</label>
        <input
          type='text'
          {...register('username')}
          className={`w-full border px-3 py-2 rounded ${errors.username ? 'border-red-500' : ''}`}
        />
        {errors.username && (
          <p className='text-red-500 text-sm'>{errors.username.message}</p>
        )}
      </div>
      <div className='mb-4'>
        <label className='block mb-1'>Email</label>
        <input
          type='email'
          {...register('email')}
          className={`w-full border px-3 py-2 rounded ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className='text-red-500 text-sm'>{errors.email.message}</p>
        )}
      </div>
      {!userId && (
        <div className='mb-4'>
          <label className='block mb-1'>Password</label>
          <input
            type='password'
            {...register('password')}
            className={`w-full border px-3 py-2 rounded ${errors.password ? 'border-red-500' : ''}`}
          />
          {errors.password && (
            <p className='text-red-500 text-sm'>{errors.password.message}</p>
          )}
        </div>
      )}
      <div className='mb-4'>
        <label className='block mb-1'>Role</label>
        <select
          {...register('role')}
          className={`w-full border px-3 py-2 rounded ${errors.role ? 'border-red-500' : ''}`}
        >
          <option value=''>Select Role</option>
          <option value='Admin'>Admin</option>
          <option value='Teacher'>Teacher</option>
          <option value='Accountant'>Accountant</option>
          <option value='Student'>Student</option>
          <option value='Parent'>Parent</option>
        </select>
        {errors.role && (
          <p className='text-red-500 text-sm'>{errors.role.message}</p>
        )}
      </div>
      <button
        type='submit'
        className='w-full bg-green-500 text-white py-2 rounded'
      >
        {userId ? 'Update User' : 'Create User'}
      </button>
    </form>
  )
}

export default UserForm
