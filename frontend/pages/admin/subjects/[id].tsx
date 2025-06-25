import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import SubjectForm from '../../../components/Subjects/SubjectForm';
import { fetchSubjectById, updateSubject as apiUpdateSubject } from '../../../utils/api';
import { Subject, UpdateSubjectDto } from '../../../types/subject';
import { UserRole } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';

const EditSubjectPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [subject, setSubject] = useState<Subject | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (id && typeof id === 'string' && user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
      const loadSubject = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const subjectData = await fetchSubjectById(id);
          setSubject(subjectData);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subject data.';
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      loadSubject();
    } else if (id && !user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
        setError("You don't have permission to view this subject.");
        setIsLoading(false);
    } else {
        setIsLoading(false);
    }
  }, [id, user]);

  const handleSubmit = async (data: UpdateSubjectDto) => {
    if (!id || typeof id !== 'string') return;

    setIsSubmitting(true);
    setError(null);
    try {
      await apiUpdateSubject(id, data);
      router.push('/admin/subjects');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subject.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (!user?.roles.includes(UserRole.SCHOOL_ADMIN) && !isLoading) {
    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <Notification message={error || "You do not have permission to edit subjects."} type="error" />
            </div>
        </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-4 text-center">Loading subject data...</div>
      </AdminLayout>
    );
  }

  if (!subject && !error) {
     return (
      <AdminLayout>
        <div className="container mx-auto p-4 text-center">Subject not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 flex justify-center">
        <div className="w-full max-w-lg">
          {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
          <h1 className="text-2xl font-semibold mb-6 text-center">Edit Subject</h1>
          {subject ? (
            <SubjectForm initialData={subject} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          ) : (
            !isLoading && <p className="text-center text-red-500">Subject data could not be loaded.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const ProtectedEditSubjectPage = () => (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
        <EditSubjectPage />
    </ProtectedRoute>
);

export default ProtectedEditSubjectPage;
