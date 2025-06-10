import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentList from './StudentList';
import { Student } from '../../types/student';
import { Button } from '../ui/Button'; // Assuming Button is used and Next.js Link is handled

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({children, href}: {children: React.ReactNode, href: string}) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock Button component if it has complex logic or styles affecting tests
// jest.mock('../ui/Button', () => {
//   return ({children, onClick, ...props}: any) => <button onClick={onClick} {...props}>{children}</button>;
// });


describe('StudentList', () => {
  const mockStudents: Student[] = [
    {
      id: 'uuid-alice-123',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      studentId: 'S101',
      dateOfBirth: '2001-05-10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'uuid-bob-456',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      studentId: 'S102',
      dateOfBirth: '2000-08-20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  it('renders correctly with a list of students', () => {
    render(<StudentList students={mockStudents} onDelete={mockOnDelete} />);

    // Check for table headers
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Student ID')).toBeInTheDocument();
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument(); // Added column
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check for student data for Alice
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('S101')).toBeInTheDocument();
    expect(screen.getByText(new Date(mockStudents[0].dateOfBirth).toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(new Date(mockStudents[0].createdAt).toLocaleDateString())).toBeInTheDocument();

    // Check for student data for Bob
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Johnson')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('S102')).toBeInTheDocument();
    expect(screen.getByText(new Date(mockStudents[1].dateOfBirth).toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(new Date(mockStudents[1].createdAt).toLocaleDateString())).toBeInTheDocument();

    // Check for "Edit" and "Delete" buttons for each student
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(editButtons.length).toBe(mockStudents.length);
    expect(deleteButtons.length).toBe(mockStudents.length);

    // Check for "Create Student" button (which is a Link wrapped Button)
    expect(screen.getByRole('link', { name: /create student/i })).toBeInTheDocument();
  });

  it('displays "No students found." when the students list is empty', () => {
    render(<StudentList students={[]} onDelete={mockOnDelete} />);
    expect(screen.getByText('No students found.')).toBeInTheDocument();
    // Ensure table is not rendered or is empty
    expect(screen.queryByText('First Name')).not.toBeInTheDocument();
  });

  it('calls onDelete with the correct student id when delete button is clicked', () => {
    render(<StudentList students={mockStudents} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Click delete for the first student (Alice)

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockStudents[0].id);

    fireEvent.click(deleteButtons[1]); // Click delete for the second student (Bob)
    expect(mockOnDelete).toHaveBeenCalledTimes(2);
    expect(mockOnDelete).toHaveBeenCalledWith(mockStudents[1].id);
  });

  it('Edit button has correct link', () => {
    render(<StudentList students={mockStudents} onDelete={mockOnDelete} />);
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks[0]).toHaveAttribute('href', `/admin/students/${mockStudents[0].id}`);
    expect(editLinks[1]).toHaveAttribute('href', `/admin/students/${mockStudents[1].id}`);
  });
});
