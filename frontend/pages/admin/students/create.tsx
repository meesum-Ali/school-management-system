import React, { useState } from 'react';
import { useRouter } from 'next/router';
import StudentForm from '../../../components/Students/StudentForm';
import { createStudent as apiCreateStudent } from '../../../utils/api';
import { CreateStudentDto } from '../../../types/student';
import Layout from '../../../components/Layout/Layout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';

const CreateStudentPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-4 flex justify-center">
          <div className="w-full max-w-2xl">
            {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
            <h1 className="text-2xl font-semibold mb-6 text-center">Create New Student</h1>
            <StudentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CreateStudentPage;
