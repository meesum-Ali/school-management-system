import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StudentForm from '../../../components/Students/StudentForm';
import { fetchStudentById, updateStudent as apiUpdateStudent, fetchClasses } from '../../../utils/api'; // Added fetchClasses
import { Student, UpdateStudentDto } from '../../../types/student';
import { UserRole } from '../../../types/user';
import { Class } from '../../../types/class'; // Added Class type
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';

const EditStudentPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // For student data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(true); // For classes data
  const [classesError, setClassesError] = useState<string | null>(null);


  useEffect(() => {
    const loadInitialData = async () => {
      if (id) {
        try {
          setIsLoading(true); // For student
          setClassesLoading(true); // For classes
          setError(null);
          setClassesError(null);

          const studentDataPromise = fetchStudentById(id as string);
          const classesDataPromise = fetchClasses();

          const [studentData, classesData] = await Promise.all([
            studentDataPromise,
            classesDataPromise,
          ]);

          setStudent(studentData);
          setAvailableClasses(classesData);

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load initial data.';
          setError(errorMessage); // Set general error for the page
          console.error(err);
        } finally {
          setIsLoading(false);
          setClassesLoading(false);
        }
      }
    };
    loadInitialData();
  }, [id]);

  const handleSubmit = async (data: UpdateStudentDto) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // The dateOfBirth should already be in YYYY-MM-DD format from the form
      // No need to convert it since it's already a string
      await apiUpdateStudent(id as string, data);
      router.push('/admin/students');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (isLoading || classesLoading) {
    return (
      <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN, UserRole.TEACHER]}>
        <AdminLayout>
          <div className="container mx-auto p-4 text-center">Loading data...</div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!student && !error) {
     return (
      <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN, UserRole.TEACHER]}>
        <AdminLayout>
          <div className="container mx-auto p-4 text-center">Student not found.</div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN, UserRole.TEACHER]}>
      <AdminLayout>
        <div className="container mx-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl">
            {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
            {classesError && <Notification message={classesError} type="error" onClose={() => setClassesError(null)} />}
            <h1 className="text-2xl font-semibold mb-6 text-center">Edit Student</h1>
            {student ? (
              <StudentForm
                student={student}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                availableClasses={availableClasses}
              />
            ) : (
              !isLoading && !classesLoading && <p className="text-center">Student data could not be loaded.</p>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default EditStudentPage;
