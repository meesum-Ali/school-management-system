import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed import
import SubjectForm from '../../../components/Subjects/SubjectForm';
import { createSubject as apiCreateSubject } from '../../../utils/api';
import { CreateSubjectDto, UpdateSubjectDto } from '../../../types/subject';
import { UserRole } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';

const CreateSubjectPage = () => {
  const navigate = useNavigate(); // Changed hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const handleSubmit = async (data: CreateSubjectDto | UpdateSubjectDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Type assertion to CreateSubjectDto since we're in the create page
      await apiCreateSubject(data as CreateSubjectDto);
      navigate('/admin/subjects'); // Changed to navigate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subject.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  if (!user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <Notification message="You do not have permission to create subjects." type="error" />
            </div>
        </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 flex justify-center">
        <div className="w-full max-w-lg">
          {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
          <h1 className="text-2xl font-semibold mb-6 text-center">Create New Subject</h1>
          <SubjectForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </AdminLayout>
  );
};

const ProtectedCreateSubjectPage = () => (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
        <CreateSubjectPage />
    </ProtectedRoute>
);

export default ProtectedCreateSubjectPage;
