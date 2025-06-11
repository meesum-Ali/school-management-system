import React, { useEffect, useState } from 'react'; // Added useState
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select'; // Added Select import
import { Student, CreateStudentDto, UpdateStudentDto } from '../../types/student';
import { Class } from '../../types/class'; // Added Class import

interface StudentFormProps {
  student?: Student; // This is StudentDetails from backend, should include classId and currentClassName
  onSubmit: (data: CreateStudentDto | UpdateStudentDto) => void;
  isSubmitting: boolean;
  availableClasses: Class[]; // Added availableClasses prop
}

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  dateOfBirth: yup.date().required('Date of birth is required').typeError('Invalid date format'),
  email: yup.string().email('Invalid email').required('Email is required'),
  studentId: yup.string().required('Student ID is required'),
  classId: yup.string().uuid('Must be a valid UUID if provided').nullable().optional(), // Added classId validation
});

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit, isSubmitting, availableClasses }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset, // Added reset
  } = useForm<CreateStudentDto | UpdateStudentDto>({
    resolver: yupResolver(schema) as Resolver<CreateStudentDto | UpdateStudentDto>,
    defaultValues: student
      ? {
          ...student,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
          classId: student.classId || '', // Set default for classId
        }
      : { // Default values for new student form
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          email: '',
          studentId: '',
          classId: '', // Default classId to empty string for "No Class" option
        },
  });

  useEffect(() => {
    if (student) {
      reset({
        ...student,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        classId: student.classId || '', // Ensure classId is reset correctly
      });
    } else {
      reset({ // Reset for create form if student becomes undefined
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        studentId: '',
        classId: '',
      });
    }
  }, [student, reset]); // Using reset from useForm

  const handleFormSubmit: SubmitHandler<CreateStudentDto | UpdateStudentDto> = (data) => {
    const dataToSubmit = { ...data };
    if (dataToSubmit.classId === '') { // Convert empty string (from "No Class" option) to null
      dataToSubmit.classId = null;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="w-full max-w-lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h2 className="text-2xl mb-4">{student ? 'Edit Student' : 'Create New Student'}</h2>

        <div>
          <label htmlFor="firstName" className="block mb-1 font-medium">First Name</label>
          <Input
            id="firstName"
            type="text"
            {...register('firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block mb-1 font-medium">Last Name</label>
          <Input
            id="lastName"
            type="text"
            {...register('lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block mb-1 font-medium">Date of Birth</label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className={errors.dateOfBirth ? 'border-red-500' : ''}
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="studentId" className="block mb-1 font-medium">Student ID</label>
          <Input
            id="studentId"
            type="text"
            {...register('studentId')}
            className={errors.studentId ? 'border-red-500' : ''}
          />
          {errors.studentId && (
            <p className="text-red-500 text-sm mt-1">{errors.studentId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="classId" className="block mb-1 font-medium">Assign to Class</label>
          <Select
            id="classId"
            {...register('classId')}
            className={errors.classId ? 'border-red-500' : ''}
          >
            <option value="">No Class / Unassign</option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>
          {errors.classId && (
            <p className="text-red-500 text-sm mt-1">{errors.classId.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : (student ? 'Update Student' : 'Create Student')}
        </Button>
      </form>
    </Card>
  );
};

export default StudentForm;
