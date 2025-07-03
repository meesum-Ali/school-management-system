import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Changed import
import ClassForm from '../../../components/Classes/ClassForm';
import {
    fetchClassById,
    updateClass as apiUpdateClass,
    fetchSubjects,
    assignSubjectToClass as apiAssignSubject,
    removeSubjectFromClass as apiRemoveSubject,
    listStudentsInClass, // Added
    assignStudentToClassViaStudentApi, // Added for unenroll
} from '../../../utils/api';
import { Class, UpdateClassDto } from '../../../types/class';
import { Subject } from '../../../types/subject';
import { Student } from '../../../types/student'; // Added
import AdminLayout from '../../../components/Layout/AdminLayout';
import ProtectedRoute from '../../../components/Auth/ProtectedRoute';
import Notification from '../../../components/Layout/Notification';
import { AuthContext } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types/user';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select'; // Assuming a Select component

const EditClassPage = () => {
  const navigate = useNavigate(); // Added for navigation
  const { id: classId } = useParams<{ id: string }>(); // classId from route, ensure type for id
  const [classInstance, setClassInstance] = useState<Class | undefined>(undefined);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectToAssign, setSelectedSubjectToAssign] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true); // For initial class load
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isUpdatingSubjects, setIsUpdatingSubjects] = useState(false);
  const [error, setError] = useState<string | null>(null); // General page/form errors
  const [subjectManagementError, setSubjectManagementError] = useState<string | null>(null);

  // State for enrolled students
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentOpError, setStudentOpError] = useState<string | null>(null); // Errors for student operations

  const { user } = useContext(AuthContext);

  const loadClassDetailsAndStudents = useCallback(async () => {
    if (classId && typeof classId === 'string' && user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
      try {
        setIsLoading(true);
        setIsLoadingStudents(true);
        setError(null);
        setStudentOpError(null);

        const classDataPromise = fetchClassById(classId);
        const studentsDataPromise = listStudentsInClass(classId);
        const allSubjectsPromise = fetchSubjects(); // Keep fetching all subjects

        const [classData, studentsData, allSubjectsData] = await Promise.all([
          classDataPromise,
          studentsDataPromise,
          allSubjectsPromise,
        ]);

        setClassInstance(classData);
        setEnrolledStudents(studentsData);
        setAllSubjects(allSubjectsData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load class or student data.';
        setError(errorMessage); // General error for the page
        setStudentOpError(errorMessage); // Also set for student section
      } finally {
        setIsLoading(false);
        setIsLoadingStudents(false);
      }
    } else if (classId && !user?.roles.includes(UserRole.SCHOOL_ADMIN)) {
      setError("You don't have permission to view this class details.");
      setIsLoading(false);
      setIsLoadingStudents(false);
    } else {
      setIsLoading(false);
      setIsLoadingStudents(false);
    }
  }, [classId, user]);


  useEffect(() => {
    loadClassDetailsAndStudents();
  }, [loadClassDetailsAndStudents]);

  const handleClassFormSubmit = async (data: UpdateClassDto) => {
    if (!classId || typeof classId !== 'string') return;

    setIsSubmittingForm(true);
    setError(null);
    try {
      const updatedClass = await apiUpdateClass(classId, data);
      setClassInstance(updatedClass); // Update local state with returned class
      // Optionally show a success notification here before or instead of push
      // navigate('/admin/classes'); // Or stay on page, example of navigation
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

  const handleUnenrollStudent = async (studentIdToUnenroll: string) => {
    if (!classId || typeof classId !== 'string') return; // Should not happen if button is visible

    // Optimistic update or set specific loading state for the student row if desired
    // For now, global loading for student operations
    setIsLoadingStudents(true);
    setStudentOpError(null);
    try {
      await assignStudentToClassViaStudentApi(studentIdToUnenroll, null); // Unassign
      // Refresh the list of enrolled students
      const updatedStudents = await listStudentsInClass(classId as string);
      setEnrolledStudents(updatedStudents);
      // Could show a success notification here
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unenroll student.';
      setStudentOpError(errorMessage);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const availableSubjectsForAssignment = allSubjects.filter(
    s => !classInstance?.subjects?.some(assigned => assigned.id === s.id)
  );

  // Client-side check, though backend will enforce
  if (!user?.roles.includes(UserRole.SCHOOL_ADMIN) && !isLoading && !isLoadingStudents) {
    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <Notification message={error || "You do not have permission to edit classes."} type="error" />
            </div>
        </AdminLayout>
    );
  }

  if (isLoading) { // Combined initial loading for class itself
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
            <>
              <ClassForm initialData={classInstance} onSubmit={handleClassFormSubmit} isSubmitting={isSubmittingForm} />

              {/* Subject Management Section - Existing Logic */}
              <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Manage Subjects</h2>
                {subjectManagementError && <Notification message={subjectManagementError} type="error" onClose={() => setSubjectManagementError(null)} />}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Assigned Subjects:</h3>
                  {classInstance.subjects && classInstance.subjects.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {classInstance.subjects.map(subject => (
                        <li key={subject.id} className="flex justify-between items-center py-1">
                          <span>{subject.name} ({subject.code})</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveSubject(subject.id)}
                            disabled={isUpdatingSubjects}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No subjects assigned yet.</p>}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Assign New Subject:</h3>
                  <div className="flex space-x-2">
                    <Select
                      value={selectedSubjectToAssign}
                      onChange={(e) => setSelectedSubjectToAssign(e.target.value)}
                      className="flex-grow"
                      disabled={isUpdatingSubjects || availableSubjectsForAssignment.length === 0}
                    >
                      <option value="">Select a subject</option>
                      {availableSubjectsForAssignment.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
                      ))}
                    </Select>
                    <Button onClick={handleAssignSubject} disabled={isUpdatingSubjects || !selectedSubjectToAssign}>
                      {isUpdatingSubjects ? 'Assigning...' : 'Assign Subject'}
                    </Button>
                  </div>
                   {availableSubjectsForAssignment.length === 0 && !selectedSubjectToAssign && <p className="text-sm text-gray-500 mt-1">All available subjects are already assigned.</p>}
                </div>
              </Card>

              {/* Enrolled Students Section - New Logic */}
              <Card className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
                {isLoadingStudents && <p>Loading students...</p>}
                {studentOpError && <Notification message={studentOpError} type="error" onClose={() => setStudentOpError(null)} />}
                {!isLoadingStudents && enrolledStudents.length === 0 && <p>No students enrolled in this class.</p>}
                {!isLoadingStudents && enrolledStudents.length > 0 && (
                  <ul className="space-y-2">
                    {enrolledStudents.map(student => (
                      <li key={student.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-600">Email: {student.email}</p>
                          <p className="text-sm text-gray-500">Student ID: {student.studentId}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnenrollStudent(student.id)}
                          // Consider adding a disabled state per student if an operation is in progress for that specific student
                        >
                          Unenroll
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Optional: Button/Modal to "Enroll Existing Student" could go here */}
              </Card>
            </>
          ) : (
            !isLoading && <p className="text-center text-red-500">Class data could not be loaded.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const ProtectedEditClassPage = () => (
    <ProtectedRoute requiredRoles={[UserRole.SCHOOL_ADMIN]}>
        <EditClassPage />
    </ProtectedRoute>
);

export default ProtectedEditClassPage;
