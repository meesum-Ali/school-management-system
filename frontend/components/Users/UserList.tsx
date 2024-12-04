import React from 'react'
import { useFetchUsers } from '../../hooks/useFetchUsers'

const UserList: React.FC = () => {
  const { data, isLoading, error } = useFetchUsers()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error fetching users: {error.message}</div>
  }

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

export default UserList
