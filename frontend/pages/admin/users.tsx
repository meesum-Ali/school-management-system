import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserList from '../../components/Users/UserList';
import { fetchUsers, deleteUser as apiDeleteUser } from '../../utils/api';
import { User, UserRole } from '../../types/user';
import AdminLayout from '../../components/Layout/AdminLayout'; // Changed to AdminLayout
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import Notification from '../../components/Layout/Notification';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // Keep if navigation is needed from here

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setError(null);
        await apiDeleteUser(id);
        // Refresh the list after deletion
        loadUsers();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete user.';
        setError(errorMessage);
        console.error(err);
      }
    }
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
      <AdminLayout> {/* Changed to AdminLayout */}
        <div className="container mx-auto p-4">
          {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
          {isLoading ? (
            <p className="text-center">Loading users...</p>
          ) : (
            <UserList users={users} onDelete={handleDeleteUser} />
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default UsersPage;
