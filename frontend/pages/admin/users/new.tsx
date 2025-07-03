import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed import
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import AdminLayout from '../../../components/Layout/AdminLayout';
import UserForm from '../../../components/Users/UserForm';
import { createUser as apiCreateUser } from '../../../utils/api';
import { CreateUserDto, UpdateUserDto } from '../../../types/user';
import Notification from '../../../components/Layout/Notification';

const AddUserPage: React.FC = () => {
  const navigate = useNavigate(); // Changed hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Type assertion to CreateUserDto since we're in the create page
      await apiCreateUser(data as CreateUserDto);
      // Optionally show success message before navigating
      navigate('/admin/users'); // Changed to navigate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user.';
      setError(errorMessage);
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={['Admin']}>
      <AdminLayout>
        <div className="container mx-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl">
            {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
            <h1 className="text-2xl font-semibold mb-6 text-center">Create New User</h1>
            <UserForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AddUserPage;
