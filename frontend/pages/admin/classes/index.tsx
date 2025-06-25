import React, { useState, useEffect, useContext } from 'react';
import ClassList from '../../../components/Classes/ClassList';
import { fetchClasses, deleteClass as apiDeleteClass } from '../../../utils/api';
import { Class } from '../../../types/class';
import { UserRole } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';

const ClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchClasses();
      setClasses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch classes.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.roles.includes(UserRole.SCHOOL_ADMIN)) { // Only load if admin
        loadClasses();
    } else {
        setIsLoading(false);
        // setError("You don't have permission to view classes."); // Optional: feedback for non-admins
    }
  }, [user]); // Reload if user changes

  const handleDeleteClass = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        setError(null);
        await apiDeleteClass(id);
        loadClasses(); // Refresh list
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete class.';
        setError(errorMessage);
        console.error(err);
      }
    }
  };

  // Conceptual RBAC for page content, actual route protection is via ProtectedRoute and backend
  if (!user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <Notification message="You do not have permission to manage classes." type="error" />
            </div>
        </AdminLayout>
    );
  }


  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
        {isLoading ? (
          <p className="text-center">Loading classes...</p>
        ) : (
          <ClassList classes={classes} onDelete={handleDeleteClass} />
        )}
      </div>
    </AdminLayout>
  );
};

// Wrap with ProtectedRoute to ensure user is authenticated and has SCHOOL_ADMIN role
const ProtectedClassesPage = () => (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
        <ClassesPage />
    </ProtectedRoute>
);

export default ProtectedClassesPage;
// Or export ClassesPage and wrap in _app.tsx or a route config if ProtectedRoute isn't prop-based for roles
// For now, this local wrapping demonstrates the intent.
// The actual ProtectedRoute might need to be refactored to accept 'requiredRoles' prop.
// If ProtectedRoute doesn't support role prop, the conditional rendering inside ClassesPage is the main client-side RBAC for content.
