import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserList from './UserList'
import { User, UserRole } from '../../types/user'

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => {
    return <a href={to}>{children}</a>
  },
}))

describe('UserList', () => {
  const mockUsers: User[] = [
    {
      id: 'uuid-1',
      username: 'alice_k',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Wonder',
      isActive: true,
      roles: [UserRole.ADMIN, UserRole.USER],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'uuid-2',
      username: 'bob_m',
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Marley',
      isActive: false,
      roles: [UserRole.TEACHER],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    mockOnDelete.mockClear()
  })

  it('renders correctly with a list of users', () => {
    render(<UserList users={mockUsers} onDelete={mockOnDelete} />)

    // Headers
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Roles')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()

    // User data
    expect(screen.getByText('alice_k')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Alice Wonder')).toBeInTheDocument()
    expect(screen.getByText('admin, user')).toBeInTheDocument() // Roles joined
    expect(screen.getByText('Active')).toBeInTheDocument()

    expect(screen.getByText('bob_m')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Marley')).toBeInTheDocument()
    expect(screen.getByText('teacher')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    expect(editButtons.length).toBe(mockUsers.length)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons.length).toBe(mockUsers.length)

    expect(
      screen.getByRole('link', { name: /create user/i }),
    ).toBeInTheDocument()
  })

  it('displays "No users found." when the users list is empty', () => {
    render(<UserList users={[]} onDelete={mockOnDelete} />)
    expect(screen.getByText('No users found.')).toBeInTheDocument()
    expect(screen.queryByText('Username')).not.toBeInTheDocument()
  })

  it('calls onDelete with the correct user id when delete button is clicked', () => {
    render(<UserList users={mockUsers} onDelete={mockOnDelete} />)

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0]) // Delete Alice
    expect(mockOnDelete).toHaveBeenCalledTimes(1)
    expect(mockOnDelete).toHaveBeenCalledWith(mockUsers[0].id)

    fireEvent.click(deleteButtons[1]) // Delete Bob
    expect(mockOnDelete).toHaveBeenCalledTimes(2)
    expect(mockOnDelete).toHaveBeenCalledWith(mockUsers[1].id)
  })

  it('Edit button has correct link', () => {
    render(<UserList users={mockUsers} onDelete={mockOnDelete} />)
    const editLinks = screen.getAllByRole('link', { name: /edit/i }) // Edit is a button within a link
    expect(editLinks[0].closest('a')).toHaveAttribute(
      'href',
      `/admin/users/${mockUsers[0].id}`,
    )
    expect(editLinks[1].closest('a')).toHaveAttribute(
      'href',
      `/admin/users/${mockUsers[1].id}`,
    )
  })
})
