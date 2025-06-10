import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassForm from './ClassForm';
import { Class, CreateClassDto } from '../../types/class';

describe('ClassForm', () => {
  const mockOnSubmit = jest.fn();
  const mockClass: Class = {
    id: 'class-uuid-123',
    name: 'Existing Class',
    level: 'Grade 9',
    homeroomTeacherId: 'teacher-uuid-existing',
    subjects: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly for creating a new class', () => {
    render(<ClassForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByLabelText(/class name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/level\/grade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/homeroom teacher id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create class/i })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing class and pre-fills data', async () => {
    render(<ClassForm initialData={mockClass} onSubmit={mockOnSubmit} isSubmitting={false} />);

    // Default values are set by react-hook-form's defaultValues or useEffect -> reset
    await waitFor(() => {
        expect(screen.getByLabelText(/class name/i)).toHaveValue(mockClass.name);
        expect(screen.getByLabelText(/level\/grade/i)).toHaveValue(mockClass.level);
        expect(screen.getByLabelText(/homeroom teacher id/i)).toHaveValue(mockClass.homeroomTeacherId);
    });
    expect(screen.getByRole('button', { name: /update class/i })).toBeInTheDocument();
  });

  it('calls onSubmit with form data when creating a class', async () => {
    render(<ClassForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const testData: CreateClassDto = {
      name: 'New Class 101',
      level: 'Grade 10',
      homeroomTeacherId: 'teacher-uuid-new',
    };

    fireEvent.change(screen.getByLabelText(/class name/i), { target: { value: testData.name } });
    fireEvent.change(screen.getByLabelText(/level\/grade/i), { target: { value: testData.level } });
    fireEvent.change(screen.getByLabelText(/homeroom teacher id/i), { target: { value: testData.homeroomTeacherId } });

    fireEvent.submit(screen.getByRole('button', { name: /create class/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(testData);
    });
  });

  it('calls onSubmit with empty string for homeroomTeacherId if field is cleared', async () => {
    render(<ClassForm initialData={mockClass} onSubmit={mockOnSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText(/homeroom teacher id/i), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('button', { name: /update class/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      // The form submits homeroomTeacherId as undefined if it was initially empty string and not touched,
      // or empty string if it was cleared. The service/DTO should handle this.
      // The form logic: if (dataToSubmit.homeroomTeacherId === '') { dataToSubmit.homeroomTeacherId = undefined; }
      // So, if cleared, it should be submitted as undefined.
      expect(mockOnSubmit.mock.calls[0][0].homeroomTeacherId).toBeUndefined();
    });
  });

  it('submit button is disabled when isSubmitting is true', () => {
    render(<ClassForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();
  });
});
