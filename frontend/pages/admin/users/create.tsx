import React, { useState } from 'react';
import { useRouter } from 'next/router';
import UserForm from '../../../components/Users/UserForm';
import { createUser as apiCreateUser } from '../../../utils/api';
import { CreateUserDto } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout'; // Changed to AdminLayout
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';

const CreateUserPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateUserDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiCreateUser(data);
      // Optionally show success message before navigating
      router.push('/admin/users');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user.';
      setError(errorMessage);
      console.error(err);
      setIsSubmitting(false); // Only set to false on error, so button remains disabled on success until navigation
    }
    // Do not set isSubmitting to false here if navigation happens, to avoid brief flash of enabled button
  };

  return (
    <ProtectedRoute> {/* Add roles={['Admin']} if needed */}
      <AdminLayout> {/* Changed to AdminLayout */}
        <div className="container mx-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl"> {/* Matched UserForm width */}
            {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
            <h1 className="text-2xl font-semibold mb-6 text-center">Create New User</h1>
            <UserForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default CreateUserPage;
