import React, { useState, useEffect, useContext } from 'react';
import SchoolList from '../../../components/Schools/SchoolList';
import { fetchSchools, deleteSchool as apiDeleteSchool } from '../../../utils/api';
import { School } from '../../../types/school';
import { UserRole } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';

const SchoolsPage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const loadSchools = async () => {
    if (!user || !user.roles.includes(UserRole.SUPER_ADMIN)) {
      setError("You don't have permission to view schools.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSchools();
      setSchools(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schools.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [user]); // Reload if user changes, to re-check permissions

  const handleDeleteSchool = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this school? This action is critical and may affect many users and data.')) {
      try {
        setError(null);
        await apiDeleteSchool(id);
        loadSchools(); // Refresh list
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete school.';
        setError(errorMessage);
        console.error(err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
        {isLoading ? (
          <p className="text-center">Loading schools...</p>
        ) : !user || !user.roles.includes(UserRole.SUPER_ADMIN) ? (
           // This case should ideally be caught by ProtectedRoute, but as a fallback:
          <Notification message="Access Denied: You do not have permission to manage schools." type="error" />
        ) : (
          <SchoolList schools={schools} onDelete={handleDeleteSchool} />
        )}
      </div>
    </AdminLayout>
  );
};

const ProtectedSchoolsPage = () => (
  <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
    <SchoolsPage />
  </ProtectedRoute>
);

export default ProtectedSchoolsPage;
