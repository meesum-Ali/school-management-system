import React from 'react'
import Link from 'next/link'
import { useFetchUsers } from '../../hooks/useFetchUsers'
import Notification from '../Layout/Notification'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const UserList: React.FC = () => {
  const { data, isLoading, error } = useFetchUsers()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Notification message={`Error fetching users: ${error.message}`} type='error' />
    )
  }

  return (
    <Card>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold'>Users</h2>
        <Link href='/admin/users/new'>
          <Button className='w-auto px-4 py-2'>Add User</Button>
        </Link>
      </div>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Username</th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Role</th>
            <th className='px-4 py-2'></th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {data.map((user) => (
            <tr key={user.id}>
              <td className='px-4 py-2'>{user.username}</td>
              <td className='px-4 py-2'>{user.email}</td>
              <td className='px-4 py-2'>{user.role}</td>
              <td className='px-4 py-2 text-right'>
                <Link href={`/admin/users/${user.id}`} className='text-blue-500 hover:underline'>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default UserList
