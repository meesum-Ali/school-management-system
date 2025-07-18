import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Changed import
import UserForm from '../../../components/Users/UserForm';
import { fetchUserById, updateUser as apiUpdateUser } from '../../../utils/api';
import { User, UpdateUserDto, UserRole } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout'; // Changed to AdminLayout
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';

const EditUserPage = () => {
  const navigate = useNavigate(); // Added for navigation
  const { id } = useParams<{ id: string }>(); // Changed to useParams, ensure type for id
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const loadUser = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const userData = await fetchUserById(id);
          setUser(userData);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data.';
          setError(errorMessage);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      loadUser();
    } else {
      // Handle cases where id is not available or not a string (e.g., redirect or show error)
      setIsLoading(false);
      // setError("Invalid user ID.");
    }
  }, [id]);

  const handleSubmit = async (data: UpdateUserDto) => {
    if (!id || typeof id !== 'string') return;

    setIsSubmitting(true);
    setError(null);
    try {
      await apiUpdateUser(id, data);
      // Optionally show success message
      navigate('/admin/users'); // Changed to navigate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user.';
      setError(errorMessage);
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
        <AdminLayout>
          <div className="container mx-auto p-4 text-center">Loading user data...</div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!user && !error) {
     return (
      <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
        <AdminLayout>
          <div className="container mx-auto p-4 text-center">User not found.</div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
      <AdminLayout> {/* Changed to AdminLayout */}
        <div className="container mx-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl"> {/* Matched UserForm width */}
            {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
            <h1 className="text-2xl font-semibold mb-6 text-center">Edit User</h1>
            {user ? (
              <UserForm user={user} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            ) : (
              !isLoading && <p className="text-center text-red-500">User data could not be loaded or user not found.</p>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default EditUserPage;
