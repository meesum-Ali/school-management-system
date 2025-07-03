import React, { useState, useEffect } from 'react';
// Removed useRouter import as it's not used
import StudentList from '../../components/Students/StudentList';
import { fetchStudents, deleteStudent as apiDeleteStudent } from '../../utils/api';
import { Student } from '../../types/student';
import { UserRole } from '../../types/user';
import AdminLayout from '../../components/Layout/AdminLayout'; // Changed to AdminLayout
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import Notification from '../../components/Layout/Notification';

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // Removed as it's not used

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

  const handleDelete = async (id: string) => { // ID is now string
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setError(null);
        await apiDeleteStudent(id); // No need for toString() anymore
        // Refresh the list after deletion
        loadStudents();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete student.');
        console.error(err);
      }
    }
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN]}>
      <AdminLayout> {/* Changed to AdminLayout */}
        <div className="container mx-auto p-4">
          {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
          {isLoading ? (
            <p>Loading students...</p>
          ) : (
            <StudentList students={students} onDelete={handleDelete} />
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default StudentsPage;
