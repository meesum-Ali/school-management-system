import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StudentForm from '../../../components/Students/StudentForm';
import { fetchStudentById, updateStudent as apiUpdateStudent } from '../../../utils/api';
import { Student, UpdateStudentDto } from '../../../types/student';
import Layout from '../../../components/Layout/Layout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification'; // Assuming this component exists

const EditStudentPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const loadStudent = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const studentData = await fetchStudentById(id as string);
          setStudent(studentData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch student data.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      loadStudent();
    }
  }, [id]);

  const handleSubmit = async (data: UpdateStudentDto) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Ensure dateOfBirth is in YYYY-MM-DD format if it's a Date object
      const payload: UpdateStudentDto = {
        ...data,
        dateOfBirth: data.dateOfBirth instanceof Date ? data.dateOfBirth.toISOString().split('T')[0] : data.dateOfBirth,
      };
      await apiUpdateStudent(id as string, payload);
      router.push('/admin/students');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto p-4 text-center">Loading student data...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!student && !isLoading && !error) {
     return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto p-4 text-center">Student not found.</div>
        </Layout>
      </ProtectedRoute>
    );
  }


  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl">
            {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
            <h1 className="text-2xl font-semibold mb-6 text-center">Edit Student</h1>
            {student ? (
              <StudentForm student={student} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            ) : (
              !isLoading && <p className="text-center">Student data could not be loaded.</p>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default EditStudentPage;
