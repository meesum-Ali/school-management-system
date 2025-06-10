import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StudentList from '../../components/Students/StudentList';
import { fetchStudents, deleteStudent as apiDeleteStudent } from '../../utils/api';
import { Student } from '../../types/student';
import Layout from '../../components/Layout/Layout';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import Notification from '../../components/Layout/Notification'; // Assuming this component exists

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setError(null);
        await apiDeleteStudent(id.toString());
        // Refresh the list after deletion
        loadStudents();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete student.');
        console.error(err);
      }
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-4">
          {error && <Notification message={error} type="error" />}
          {isLoading ? (
            <p>Loading students...</p>
          ) : (
            <StudentList students={students} onDelete={handleDelete} />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default StudentsPage;
