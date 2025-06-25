import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import ClassForm from '../../../components/Classes/ClassForm';
import { createClass as apiCreateClass } from '../../../utils/api';
import { Class, CreateClassDto, UpdateClassDto } from '../../../types/class';
import { UserRole } from '../../../types/user';
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';


const CreateClassPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const handleSubmit = async (data: CreateClassDto | UpdateClassDto) => {
    // Since this is a create form, we can safely cast to CreateClassDto
    const createData = data as CreateClassDto;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await apiCreateClass(createData);
      router.push('/admin/classes');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create class.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Client-side check, though backend will enforce
  if (!user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <Notification message="You do not have permission to create classes." type="error" />
            </div>
        </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 flex justify-center">
        <div className="w-full max-w-lg">
          {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
          <h1 className="text-2xl font-semibold mb-6 text-center">Create New Class</h1>
          <ClassForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </AdminLayout>
  );
};

const ProtectedCreateClassPage = () => (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
        <CreateClassPage />
    </ProtectedRoute>
);

export default ProtectedCreateClassPage;
