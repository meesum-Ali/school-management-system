import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SubjectForm from './SubjectForm'
import { Subject, CreateSubjectDto } from '../../types/subject'

// Mock Textarea component
jest.mock('../ui/Textarea', () => (props: any) => (
  <textarea data-testid='description-textarea' {...props} />
))

describe('SubjectForm', () => {
  const mockOnSubmit = jest.fn()
  const mockSubject: Subject = {
    id: 'subject-uuid-123',
    name: 'Existing Subject',
    code: 'SUB101',
    description: 'An existing subject description.',
    classes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders correctly for creating a new subject', () => {
    render(<SubjectForm onSubmit={mockOnSubmit} isSubmitting={false} />)

    expect(screen.getByLabelText(/subject name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/code \(optional\)/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/description \(optional\)/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create subject/i }),
    ).toBeInTheDocument()
  })

  it('renders correctly for editing an existing subject and pre-fills data', async () => {
    render(
      <SubjectForm
        initialData={mockSubject}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/subject name/i)).toHaveValue(
        mockSubject.name,
      )
      expect(screen.getByLabelText(/code \(optional\)/i)).toHaveValue(
        mockSubject.code,
      )
      expect(screen.getByLabelText(/description \(optional\)/i)).toHaveValue(
        mockSubject.description,
      )
    })
    expect(
      screen.getByRole('button', { name: /update subject/i }),
    ).toBeInTheDocument()
  })

  it('calls onSubmit with form data when creating a subject', async () => {
    render(<SubjectForm onSubmit={mockOnSubmit} isSubmitting={false} />)

    const testData: CreateSubjectDto = {
      name: 'New Subject ABC',
      code: 'ABC001',
      description: 'Description for ABC',
    }

    fireEvent.change(screen.getByLabelText(/subject name/i), {
      target: { value: testData.name },
    })
    fireEvent.change(screen.getByLabelText(/code \(optional\)/i), {
      target: { value: testData.code },
    })
    fireEvent.change(screen.getByLabelText(/description \(optional\)/i), {
      target: { value: testData.description },
    })

    fireEvent.submit(screen.getByRole('button', { name: /create subject/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      expect(mockOnSubmit).toHaveBeenCalledWith(testData)
    })
  })

  it('calls onSubmit with empty string code/description converted to undefined', async () => {
    render(<SubjectForm onSubmit={mockOnSubmit} isSubmitting={false} />)

    const testData = {
      name: 'Test Name Only',
      code: '',
      description: '',
    }

    fireEvent.change(screen.getByLabelText(/subject name/i), {
      target: { value: testData.name },
    })
    fireEvent.change(screen.getByLabelText(/code \(optional\)/i), {
      target: { value: testData.code },
    })
    fireEvent.change(screen.getByLabelText(/description \(optional\)/i), {
      target: { value: testData.description },
    })

    fireEvent.submit(screen.getByRole('button', { name: /create subject/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: testData.name,
        code: undefined, // As per form logic
        description: undefined, // As per form logic
      })
    })
  })

  it('submit button is disabled when isSubmitting is true', () => {
    render(<SubjectForm onSubmit={mockOnSubmit} isSubmitting={true} />)
    expect(
      screen.getByRole('button', { name: /submitting.../i }),
    ).toBeDisabled()
  })
})
