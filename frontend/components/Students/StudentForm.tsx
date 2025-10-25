import React, { useEffect } from 'react'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
} from '../../types/student'
import { Class } from '../../types/class' // Added Class import

interface StudentFormProps {
  student?: Student // This is StudentDetails from backend, should include classId and currentClassName
  onSubmit: (data: CreateStudentDto | UpdateStudentDto) => void
  isSubmitting: boolean
  availableClasses: Class[] // Added availableClasses prop
}

// Define form values type that matches the form structure
interface StudentFormValues {
  firstName: string
  lastName: string
  dateOfBirth: string // string for form input (YYYY-MM-DD)
  email: string
  studentId: string
  classId: string | null
}

const schema = yup.object().shape<Record<keyof StudentFormValues, any>>({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required')
    .test('is-valid-date', 'Invalid date format', (value) => {
      if (!value) return false
      return !isNaN(Date.parse(value))
    }),
  email: yup.string().email('Invalid email').required('Email is required'),
  studentId: yup.string().required('Student ID is required'),
  classId: yup.string().uuid('Must be a valid UUID if provided').nullable(),
})

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  isSubmitting,
  availableClasses,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormValues>({
    resolver: yupResolver(schema) as Resolver<StudentFormValues>,
    defaultValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      dateOfBirth: student?.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split('T')[0]
        : '',
      email: student?.email || '',
      studentId: student?.studentId || '',
      classId: student?.classId || null,
    },
  })

  const onSubmitForm: SubmitHandler<StudentFormValues> = (data) => {
    // Convert form data to DTO format
    const formData = {
      ...data,
      // Convert empty string to null for classId
      classId: data.classId || null,
    }

    // Call the original onSubmit with properly typed data
    onSubmit(formData as CreateStudentDto | UpdateStudentDto)
  }

  useEffect(() => {
    if (student) {
      reset({
        ...student,
        dateOfBirth: student.dateOfBirth
          ? new Date(student.dateOfBirth).toISOString().split('T')[0]
          : '',
        classId: student.classId || null,
      })
    } else {
      reset({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        studentId: '',
        classId: null,
      })
    }
  }, [student, reset])

  return (
    <Card className='w-full max-w-lg'>
      <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
        <h2 className='text-2xl mb-4'>
          {student ? 'Edit Student' : 'Create New Student'}
        </h2>

        <div>
          <label htmlFor='firstName' className='block mb-1 font-medium'>
            First Name
          </label>
          <Input
            id='firstName'
            type='text'
            {...register('firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor='lastName' className='block mb-1 font-medium'>
            Last Name
          </label>
          <Input
            id='lastName'
            type='text'
            {...register('lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor='dateOfBirth' className='block mb-1 font-medium'>
            Date of Birth
          </label>
          <Input
            id='dateOfBirth'
            type='date'
            {...register('dateOfBirth')}
            className={errors.dateOfBirth ? 'border-red-500' : ''}
          />
          {errors.dateOfBirth && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor='email' className='block mb-1 font-medium'>
            Email
          </label>
          <Input
            id='email'
            type='email'
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor='studentId' className='block mb-1 font-medium'>
            Student ID
          </label>
          <Input
            id='studentId'
            type='text'
            {...register('studentId')}
            className={errors.studentId ? 'border-red-500' : ''}
          />
          {errors.studentId && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.studentId.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor='classId' className='block mb-1 font-medium'>
            Assign to Class
          </label>
          <select
            id='classId'
            {...register('classId')}
            className={`w-full p-2 border rounded ${errors.classId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value=''>No Class / Unassign</option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.classId.message}
            </p>
          )}
        </div>

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting
            ? 'Submitting...'
            : student
              ? 'Update Student'
              : 'Create Student'}
        </Button>
      </form>
    </Card>
  )
}

export default StudentForm
