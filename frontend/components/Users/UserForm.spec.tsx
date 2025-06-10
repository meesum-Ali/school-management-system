import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserForm from './UserForm';
import { User, CreateUserDto, UserRole } from '../../types/user';

// Mock PasswordToggle or ensure it's simple enough not to need specific mocking
jest.mock('../ui/PasswordToggle', () => (props: any) => <input type="password" data-testid="password-input" {...props.register(props.name)} />);

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();
  const mockUser: User = {
    id: 'user-uuid-123',
    username: 'john.doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    roles: [UserRole.USER, UserRole.ADMIN],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly for creating a new user', () => {
    render(<UserForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument(); // Label for new password
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/roles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active user/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing user and pre-fills data (excluding password)', async () => {
    render(<UserForm user={mockUser} onSubmit={mockOnSubmit} isSubmitting={false} />);

    await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toHaveValue(mockUser.username);
        expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
        expect(screen.getByLabelText(/first name/i)).toHaveValue(mockUser.firstName);
        expect(screen.getByLabelText(/last name/i)).toHaveValue(mockUser.lastName);
        // Password field should be present but empty for edits
        expect(screen.getByLabelText(/new password/i)).toHaveValue('');

        // Check roles checkboxes
        mockUser.roles.forEach(role => {
            const roleCheckbox = screen.getByLabelText(new RegExp(role, 'i')) as HTMLInputElement;
            expect(roleCheckbox.checked).toBe(true);
        });
        if (!mockUser.roles.includes(UserRole.TEACHER)) { // Example of a role not assigned
             const teacherCheckbox = screen.getByLabelText(new RegExp(UserRole.TEACHER, 'i')) as HTMLInputElement;
             expect(teacherCheckbox.checked).toBe(false);
        }

        expect((screen.getByLabelText(/active user/i) as HTMLInputElement).checked).toBe(mockUser.isActive);
    });
    expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument();
  });

  it('calls onSubmit with form data when creating a user', async () => {
    render(<UserForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const testData: CreateUserDto = {
      username: 'newbie',
      email: 'newbie@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'Bie',
      roles: [UserRole.TEACHER],
      isActive: false,
    };

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: testData.username } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testData.email } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: testData.password } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: testData.firstName } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: testData.lastName } });

    // Uncheck default UserRole.USER if present
    const defaultUserRoleCheckbox = screen.getByLabelText(new RegExp(UserRole.USER, 'i')) as HTMLInputElement;
    if (defaultUserRoleCheckbox.checked) {
        fireEvent.click(defaultUserRoleCheckbox);
    }
    // Check UserRole.TEACHER
    fireEvent.click(screen.getByLabelText(new RegExp(UserRole.TEACHER, 'i')));

    const activeCheckbox = screen.getByLabelText(/active user/i) as HTMLInputElement;
    if (activeCheckbox.checked) { // Default is true, so uncheck it for testData.isActive = false
        fireEvent.click(activeCheckbox);
    }


    fireEvent.submit(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.username).toBe(testData.username);
      expect(submittedData.email).toBe(testData.email);
      expect(submittedData.password).toBe(testData.password);
      expect(submittedData.firstName).toBe(testData.firstName);
      expect(submittedData.lastName).toBe(testData.lastName);
      expect(submittedData.roles).toEqual(expect.arrayContaining(testData.roles));
      expect(submittedData.isActive).toBe(testData.isActive);
    });
  });

  it('calls onSubmit with updated data (and no password if not changed) when editing', async () => {
    render(<UserForm user={mockUser} onSubmit={mockOnSubmit} isSubmitting={false} />);

    const newFirstName = 'Johnny';
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: newFirstName } });
    // Uncheck ADMIN role
    fireEvent.click(screen.getByLabelText(new RegExp(UserRole.ADMIN, 'i')));

    fireEvent.submit(screen.getByRole('button', { name: /update user/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.firstName).toBe(newFirstName);
      expect(submittedData.password).toBeUndefined(); // Password not changed, should not be submitted
      expect(submittedData.roles).toEqual([UserRole.USER]); // Admin role removed
    });
  });

  it('submit button is disabled when isSubmitting is true', () => {
    render(<UserForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: /submitting.../i })).toBeDisabled();
  });
});
