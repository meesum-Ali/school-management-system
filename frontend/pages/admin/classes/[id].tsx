import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import ClassForm from '../../../components/Classes/ClassForm';
import {
    fetchClassById,
    updateClass as apiUpdateClass,
    fetchSubjects, // For fetching all available subjects
    assignSubjectToClass as apiAssignSubject,
    removeSubjectFromClass as apiRemoveSubject,
} from '../../../utils/api';
import { Class, UpdateClassDto } from '../../../types/class';
import { Subject } from '../../../types/subject'; // For available subjects list
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/user';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select'; // Assuming a Select component

const EditClassPage = () => {
  const router = useRouter();
  const { id: classId } = router.query; // classId from route
  const [classInstance, setClassInstance] = useState<Class | undefined>(undefined);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectToAssign, setSelectedSubjectToAssign] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true); // For initial class load
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // For class form update
  const [isUpdatingSubjects, setIsUpdatingSubjects] = useState(false); // For assign/remove subject actions
  const [error, setError] = useState<string | null>(null);
  const [subjectManagementError, setSubjectManagementError] = useState<string|null>(null);

  const { user } = useContext(AuthContext);

  const loadClassDetails = useCallback(async () => {
    if (classId && typeof classId === 'string' && user?.roles.includes(UserRole.ADMIN)) {
      try {
        setIsLoading(true);
        setError(null);
        const classData = await fetchClassById(classId);
        setClassInstance(classData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch class data.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else if (classId && !user?.roles.includes(UserRole.ADMIN)) {
      setError("You don't have permission to view this class.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [classId, user]);

  const loadAllSubjects = useCallback(async () => {
    if (user?.roles.includes(UserRole.ADMIN)) {
        try {
            const subjectsData = await fetchSubjects();
            setAllSubjects(subjectsData);
        } catch (err) {
            console.error("Failed to fetch subjects", err);
            setError('Could not load available subjects.'); // Or a different error state
        }
    }
  }, [user]);

  useEffect(() => {
    loadClassDetails();
    loadAllSubjects();
  }, [loadClassDetails, loadAllSubjects]);

  const handleClassFormSubmit = async (data: UpdateClassDto) => {
    if (!classId || typeof classId !== 'string') return;

    setIsSubmittingForm(true);
    setError(null);
    try {
      const updatedClass = await apiUpdateClass(classId, data);
      setClassInstance(updatedClass); // Update local state with returned class
      // Optionally show a success notification here before or instead of push
      // router.push('/admin/classes'); // Or stay on page
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update class.';
      setError(errorMessage);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleAssignSubject = async () => {
    if (!classId || typeof classId !== 'string' || !selectedSubjectToAssign) {
      setSubjectManagementError("Please select a subject to assign.");
      return;
    }
    setIsUpdatingSubjects(true);
    setSubjectManagementError(null);
    try {
      const updatedClass = await apiAssignSubject(classId, selectedSubjectToAssign);
      setClassInstance(updatedClass); // Refresh class data with new subject list
      setSelectedSubjectToAssign(''); // Reset dropdown
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign subject.';
      setSubjectManagementError(errorMessage);
    } finally {
      setIsUpdatingSubjects(false);
    }
  };

  const handleRemoveSubject = async (subjectIdToRemove: string) => {
    if (!classId || typeof classId !== 'string') return;
    setIsUpdatingSubjects(true);
    setSubjectManagementError(null);
    try {
      const updatedClass = await apiRemoveSubject(classId, subjectIdToRemove);
      setClassInstance(updatedClass); // Refresh class data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove subject.';
      setSubjectManagementError(errorMessage);
    } finally {
      setIsUpdatingSubjects(false);
    }
  };

  const availableSubjectsForAssignment = allSubjects.filter(
    s => !classInstance?.subjects?.some(assigned => assigned.id === s.id)
  );

  // Client-side check, though backend will enforce
  if (!user?.roles.includes(UserRole.ADMIN) && !isLoading) { // Avoid showing if still loading user roles
    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <Notification message={error || "You do not have permission to edit classes."} type="error" />
            </div>
        </AdminLayout>
    );
  }


  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-4 text-center">Loading class data...</div>
      </AdminLayout>
    );
  }

  if (!classInstance && !error) {
     return (
      <AdminLayout>
        <div className="container mx-auto p-4 text-center">Class not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 flex justify-center">
        <div className="w-full max-w-lg">
          {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
          <h1 className="text-2xl font-semibold mb-6 text-center">Edit Class</h1>
          {classInstance ? (
            <ClassForm initialData={classInstance} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          ) : (
            !isLoading && <p className="text-center text-red-500">Class data could not be loaded.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const ProtectedEditClassPage = () => (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <EditClassPage />
    </ProtectedRoute>
);

export default ProtectedEditClassPage;
