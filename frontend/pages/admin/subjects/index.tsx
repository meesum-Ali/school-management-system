import React, { useState, useEffect, useContext } from 'react';
import SubjectList from '../../../components/Subjects/SubjectList';
import { fetchSubjects, deleteSubject as apiDeleteSubject } from '../../../utils/api';
import { Subject } from '../../../types/subject';
import { UserRole } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subjects.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.roles.includes(UserRole.ADMIN)) {
        loadSubjects();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        setError(null);
        await apiDeleteSubject(id);
        loadSubjects();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete subject.';
        setError(errorMessage);
      }
    }
  };

  if (!user?.roles.includes(UserRole.ADMIN) && !isLoading) {
    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <Notification message="You do not have permission to manage subjects." type="error" />
            </div>
        </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
        {isLoading ? (
          <p className="text-center">Loading subjects...</p>
        ) : (
          <SubjectList subjects={subjects} onDelete={handleDeleteSubject} />
        )}
      </div>
    </AdminLayout>
  );
};

const ProtectedSubjectsPage = () => (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <SubjectsPage />
    </ProtectedRoute>
);

export default ProtectedSubjectsPage;
