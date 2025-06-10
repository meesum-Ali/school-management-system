import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentForm from './StudentForm';
import { Student, CreateStudentDto } from '../../types/student'; // UpdateStudentDto might also be needed if testing edit mode extensively

// Mock react-hook-form's useForm
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (fn: any) => fn, // Mock handleSubmit to directly call the passed function
    setValue: jest.fn(),
    formState: { errors: {} }, // Mock errors object
    // Add other methods or properties if your component uses them
  }),
}));


describe('StudentForm', () => {
  const mockOnSubmit = jest.fn();
  const mockStudent: Student = {
    id: 'student-uuid-123', // Changed to string UUID
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2000-01-01',
    email: 'john.doe@example.com',
    studentId: 'S123',
    createdAt: new Date().toISOString(), // Added
    updatedAt: new Date().toISOString(), // Added
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
     // Re-mock useForm before each test to reset specific mock behaviors if needed
     (jest.requireMock('react-hook-form') as any).useForm = () => ({
        register: jest.fn((name) => ({ name: name })), // Make register return an object with name
        handleSubmit: (fn: any) => (e: any) => { e.preventDefault(); fn({
            firstName: screen.getByLabelText(/first name/i).getAttribute('value'),
            lastName: screen.getByLabelText(/last name/i).getAttribute('value'),
            dateOfBirth: screen.getByLabelText(/date of birth/i).getAttribute('value'),
            email: screen.getByLabelText(/email/i).getAttribute('value'),
            studentId: screen.getByLabelText(/student id/i).getAttribute('value'),
        }); },
        setValue: jest.fn(),
        formState: { errors: {} },
        watch: jest.fn(), // Add watch if used
        control: {}, // Add control if used
      });
  });

  it('renders correctly for creating a new student', () => {
    render(<StudentForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create student/i })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing student and pre-fills data', () => {
     (jest.requireMock('react-hook-form') as any).useForm = () => ({
        register: jest.fn((name) => ({ name: name })),
        handleSubmit: (fn: any) => (e: any) => { e.preventDefault(); fn({}); }, // Simplified for this test
        setValue: jest.fn((name, value) => {
            // Mock setValue to update the input's value for testing pre-fill
            const input = screen.getByLabelText(new RegExp(name, 'i'));
            if (input) {
              fireEvent.change(input, { target: { value: value } });
            }
        }),
        formState: { errors: {} },
        defaultValues: { // Simulate defaultValues behavior from react-hook-form
            ...mockStudent,
            dateOfBirth: new Date(mockStudent.dateOfBirth).toISOString().split('T')[0],
        }
      });

    render(<StudentForm student={mockStudent} onSubmit={mockOnSubmit} isSubmitting={false} />);

    // Wait for inputs to be populated by useEffect and setValue
    // For this simplified mock, we assume defaultValues passed to useForm would handle it.
    // More robust mocking of setValue might be needed for complex scenarios.
    expect(screen.getByLabelText(/first name/i)).toHaveValue(mockStudent.firstName);
    expect(screen.getByLabelText(/last name/i)).toHaveValue(mockStudent.lastName);
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue(new Date(mockStudent.dateOfBirth).toISOString().split('T')[0]);
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockStudent.email);
    expect(screen.getByLabelText(/student id/i)).toHaveValue(mockStudent.studentId);
    expect(screen.getByRole('button', { name: /update student/i })).toBeInTheDocument();
  });


  it('calls onSubmit with form data when creating a student', async () => {
    render(<StudentForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const testData: CreateStudentDto = {
      firstName: 'Test First',
      lastName: 'Test Last',
      dateOfBirth: '2002-02-02',
      email: 'test@example.com',
      studentId: 'S999',
    };

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: testData.firstName } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: testData.lastName } });
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: testData.dateOfBirth } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testData.email } });
    fireEvent.change(screen.getByLabelText(/student id/i), { target: { value: testData.studentId } });

    fireEvent.submit(screen.getByRole('button', { name: /create student/i }));

    // The mocked handleSubmit now directly calls the passed function with the data
    // It also simulates data collection from the form fields
    await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining(testData)
        );
    });
  });

  // Basic validation test (more detailed validation tests would require deeper yup/resolver mocking)
  it('shows submit button as disabled when isSubmitting is true', () => {
    render(<StudentForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();
  });
});
