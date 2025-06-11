import React, { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/router';
import StudentForm from '../../../components/Students/StudentForm';
import { createStudent as apiCreateStudent, fetchClasses } from '../../../utils/api'; // Added fetchClasses
import { CreateStudentDto } from '../../../types/student';
import { Class } from '../../../types/class'; // Added Class type
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';

const CreateStudentPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [classesLoadingError, setClassesLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setClassesLoadingError(null);
        const classes = await fetchClasses();
        setAvailableClasses(classes);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load classes for selection.';
        console.error(errorMessage);
        setClassesLoadingError(errorMessage);
        // Optionally, set a general error for the page if classes are critical
        // setError(errorMessage);
      }
    };
    loadClasses();
  }, []);

  const handleSubmit = async (data: CreateStudentDto) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Ensure dateOfBirth is in YYYY-MM-DD format if it's a Date object
      const payload: CreateStudentDto = {
        ...data,
        dateOfBirth: data.dateOfBirth instanceof Date ? data.dateOfBirth.toISOString().split('T')[0] : data.dateOfBirth,
      };
      await apiCreateStudent(payload);
      router.push('/admin/students');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute> {/* Add roles if needed */}
      <AdminLayout>
        <div className="container mx-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl">
            {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
            {classesLoadingError && <Notification message={classesLoadingError} type="error" onClose={() => setClassesLoadingError(null)} />}
            <h1 className="text-2xl font-semibold mb-6 text-center">Create New Student</h1>
            <StudentForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              availableClasses={availableClasses}
            />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default CreateStudentPage;
