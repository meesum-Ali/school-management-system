import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassList from './ClassList';
import { Class } from '../../types/class'; // Assuming Class type includes id, name, level, homeroomTeacherId, subjects array

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ClassList', () => {
  const mockClasses: Class[] = [
    {
      id: 'uuid-class-1',
      name: 'Math 101',
      level: 'Grade 10',
      homeroomTeacherId: 'teacher-uuid-1',
      subjects: [{ id: 'sub1', name: 'Algebra', code: 'M101', description: '', createdAt: '', updatedAt: '' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'uuid-class-2',
      name: 'History 202',
      level: 'Grade 11',
      homeroomTeacherId: null,
      subjects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ];
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  it('renders correctly with a list of classes', () => {
    render(<ClassList classes={mockClasses} onDelete={mockOnDelete} />);

    expect(screen.getByText('Class Management')).toBeInTheDocument();
    expect(screen.getByText('Create Class')).toBeInTheDocument();

    // Headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Homeroom Teacher ID')).toBeInTheDocument();
    expect(screen.getByText('Subjects')).toBeInTheDocument(); // Number of subjects
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Class data
    expect(screen.getByText('Math 101')).toBeInTheDocument();
    expect(screen.getByText('Grade 10')).toBeInTheDocument();
    expect(screen.getByText('teacher-uuid-1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Number of subjects for Math 101

    expect(screen.getByText('History 202')).toBeInTheDocument();
    expect(screen.getByText('Grade 11')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument(); // Homeroom Teacher ID for History 202
    expect(screen.getByText('0')).toBeInTheDocument(); // Number of subjects for History 202

    const editButtons = screen.getAllByRole('button', { name: /edit \/ view subjects/i });
    expect(editButtons.length).toBe(mockClasses.length);
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBe(mockClasses.length);
  });

  it('displays "No classes found." when the classes list is empty', () => {
    render(<ClassList classes={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText('No classes found.')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument(); // Header check
  });

  it('calls onDelete with the correct class id when delete button is clicked', () => {
    render(<ClassList classes={mockClasses} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockClasses[0].id);
  });

  it('Edit button has correct link', () => {
    render(<ClassList classes={mockClasses} onDelete={mockOnDelete} />);
    const editLinks = screen.getAllByRole('link', { name: /edit \/ view subjects/i });
    expect(editLinks[0]).toHaveAttribute('href', `/admin/classes/${mockClasses[0].id}`);
  });
});
