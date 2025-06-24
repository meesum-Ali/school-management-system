import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Resolver, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { User, CreateUserDto, UpdateUserDto, UserRole } from '../../types/user';
import { EyeSlashIcon, EyeIcon } from '@heroicons/react/24/solid';

interface UserFormProps {
  user?: User; // For editing
  onSubmit: (data: CreateUserDto | UpdateUserDto) => void;
  isSubmitting: boolean;
  // error?: string | null; // Parent page can handle notifications
  // success?: string | null;
}

// Yup schema for validation
const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().when('$isEditing', { // $isEditing context passed from useForm
    is: (isEditing: boolean) => !isEditing, // only required if not editing
    then: (s) => s.required('Password is required').min(8, 'Password must be at least 8 characters'),
    otherwise: (s) => s.min(8, 'Password must be at least 8 characters').optional().nullable(), // Optional for edit
  }),
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  isActive: yup.boolean().optional(),
  roles: yup.array().of(yup.string().oneOf(Object.values(UserRole))).min(1, 'At least one role is required').required(),
});


const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, isSubmitting }) => {
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control, // For Controller component if needed for checkboxes
    formState: { errors },
    watch // useful for debugging
  } = useForm<CreateUserDto | UpdateUserDto>({
    resolver: yupResolver(schema) as Resolver<CreateUserDto | UpdateUserDto>,
    context: { isEditing }, // Pass isEditing to yup context
    defaultValues: isEditing ? {
      ...user,
      password: '', // Password should not be pre-filled
      roles: user?.roles || [UserRole.STUDENT],
    } : {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isActive: true,
      roles: [UserRole.STUDENT],
    },
  });

  useEffect(() => {
    if (isEditing && user) {
      setValue('username', user.username);
      setValue('email', user.email);
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('isActive', user.isActive);
      setValue('roles', user.roles);
      // Do NOT set password value for editing
    }
  }, [user, isEditing, setValue]);

  // console.log("Form errors", errors);
  // console.log("Form values", watch());


  const handleFormSubmit: SubmitHandler<CreateUserDto | UpdateUserDto> = (data) => {
    const submittedData = { ...data };
    if (isEditing && !submittedData.password) { // If password field is empty during edit, don't send it
      delete submittedData.password;
    }
    onSubmit(submittedData);
  };

  const availableRoles = Object.values(UserRole);

  return (
    <Card className="w-full max-w-2xl"> {/* Increased max-width for more fields */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6"> {/* Increased spacing */}
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isEditing ? 'Edit User' : 'Create New User'}
        </h2>

        {/* Username, Email, FirstName, LastName in a grid or flex layout for better space usage? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium">Username</label>
            <Input id="username" type="text" {...register('username')} className={errors.username ? 'border-red-500' : ''}/>
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium">Email</label>
            <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="firstName" className="block mb-1 font-medium">First Name (Optional)</label>
            <Input id="firstName" type="text" {...register('firstName')} />
            {/* No error display for optional field unless specific validation added */}
          </div>

          <div>
            <label htmlFor="lastName" className="block mb-1 font-medium">Last Name (Optional)</label>
            <Input id="lastName" type="text" {...register('lastName')} />
          </div>
        </div>

        <div className="relative">
          <label htmlFor="password" className="block mb-1 font-medium">
            {isEditing ? 'New Password (Optional)' : 'Password'}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block mb-2 font-medium">Roles</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableRoles.map((role) => (
              <label key={role} htmlFor={`role-${role}`} className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  id={`role-${role}`}
                  value={role}
                  {...register('roles')}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
              </label>
            ))}
          </div>
          {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles.message}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="form-checkbox h-5 w-5 text-blue-600 mr-2"
          />
          <label htmlFor="isActive" className="font-medium">Active User</label>
          {errors.isActive && <p className="text-red-500 text-sm ml-2">{errors.isActive.message}</p>}
        </div>


        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? 'Submitting...' : (isEditing ? 'Update User' : 'Create User')}
        </Button>
      </form>
    </Card>
  );
};

export default UserForm;
