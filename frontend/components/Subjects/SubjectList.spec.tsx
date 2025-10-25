import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SubjectList from './SubjectList'
import { Subject } from '../../types/subject'

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => {
    return <a href={to}>{children}</a>
  },
}))

describe('SubjectList', () => {
  const mockSubjects: Subject[] = [
    {
      id: 'uuid-subject-1',
      name: 'Advanced Calculus',
      code: 'CALC301',
      description: 'Multivariable calculus and theorems.',
      classes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'uuid-subject-2',
      name: 'Organic Chemistry',
      code: 'CHEM202',
      description: null,
      classes: [
        {
          id: 'c1',
          name: 'Chem Class',
          level: '2',
          createdAt: '',
          updatedAt: '',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    mockOnDelete.mockClear()
  })

  it('renders correctly with a list of subjects', () => {
    render(<SubjectList subjects={mockSubjects} onDelete={mockOnDelete} />)

    expect(screen.getByText('Subject Management')).toBeInTheDocument()
    expect(screen.getByText('Create Subject')).toBeInTheDocument()

    // Headers
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Classes')).toBeInTheDocument() // Number of classes
    expect(screen.getByText('Actions')).toBeInTheDocument()

    // Subject data
    expect(screen.getByText('Advanced Calculus')).toBeInTheDocument()
    expect(screen.getByText('CALC301')).toBeInTheDocument()
    expect(
      screen.getByText('Multivariable calculus and theorems.'),
    ).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // Classes for Adv Calc

    expect(screen.getByText('Organic Chemistry')).toBeInTheDocument()
    expect(screen.getByText('CHEM202')).toBeInTheDocument()
    expect(screen.getAllByText('N/A')[0]).toBeInTheDocument() // Description for Org Chem
    expect(screen.getByText('1')).toBeInTheDocument() // Classes for Org Chem

    const editButtons = screen.getAllByRole('button', {
      name: /edit \/ view classes/i,
    })
    expect(editButtons.length).toBe(mockSubjects.length)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons.length).toBe(mockSubjects.length)
  })

  it('displays "No subjects found." when the list is empty', () => {
    render(<SubjectList subjects={[]} onDelete={mockOnDelete} />)
    expect(screen.getByText('No subjects found.')).toBeInTheDocument()
  })

  it('calls onDelete with the correct id when delete button is clicked', () => {
    render(<SubjectList subjects={mockSubjects} onDelete={mockOnDelete} />)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])
    expect(mockOnDelete).toHaveBeenCalledWith(mockSubjects[0].id)
  })

  it('Edit button has correct link', () => {
    render(<SubjectList subjects={mockSubjects} onDelete={mockOnDelete} />)
    const editLinks = screen.getAllByRole('link', {
      name: /edit \/ view classes/i,
    })
    expect(editLinks[0]).toHaveAttribute(
      'href',
      `/admin/subjects/${mockSubjects[0].id}`,
    )
  })
})
