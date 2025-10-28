import React, { useEffect } from 'react'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import {
  Teacher,
  CreateTeacherDto,
  UpdateTeacherDto,
} from '../../types/teacher'
import { User } from '../../types/user'

interface TeacherFormProps {
  teacher?: Teacher
  onSubmit: (data: CreateTeacherDto | UpdateTeacherDto) => void
  isSubmitting: boolean
  availableUsers?: User[] // Users without teacher profiles
}

// Define form values type
interface TeacherFormValues {
  userId: string
  employeeId: string
  hireDate: string // YYYY-MM-DD format
  qualification: string
  specialization: string
}

const schema = yup.object().shape<Record<keyof TeacherFormValues, any>>({
  userId: yup
    .string()
    .uuid('Must be a valid user ID')
    .required('User is required'),
  employeeId: yup
    .string()
    .required('Employee ID is required')
    .min(2, 'Employee ID must be at least 2 characters'),
  hireDate: yup
    .string()
    .required('Hire date is required')
    .test('is-valid-date', 'Invalid date format', (value) => {
      if (!value) return false
      return !isNaN(Date.parse(value))
    }),
  qualification: yup.string(),
  specialization: yup.string(),
})

const TeacherForm: React.FC<TeacherFormProps> = ({
  teacher,
  onSubmit,
  isSubmitting,
  availableUsers = [],
}) => {
  const isEditMode = !!teacher

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeacherFormValues>({
    resolver: yupResolver(schema) as Resolver<TeacherFormValues>,
    defaultValues: {
      userId: teacher?.userId || '',
      employeeId: teacher?.employeeId || '',
      hireDate: teacher?.hireDate
        ? new Date(teacher.hireDate).toISOString().split('T')[0]
        : '',
      qualification: teacher?.qualification || '',
      specialization: teacher?.specialization || '',
    },
  })

  const onSubmitForm: SubmitHandler<TeacherFormValues> = (data) => {
    // Convert form data to DTO format
    const formData = {
      userId: data.userId,
      employeeId: data.employeeId,
      hireDate: data.hireDate,
      qualification: data.qualification || undefined,
      specialization: data.specialization || undefined,
    }

    onSubmit(formData as CreateTeacherDto | UpdateTeacherDto)
  }

  useEffect(() => {
    if (teacher) {
      reset({
        userId: teacher.userId,
        employeeId: teacher.employeeId,
        hireDate: teacher.hireDate
          ? new Date(teacher.hireDate).toISOString().split('T')[0]
          : '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
      })
    } else {
      reset({
        userId: '',
        employeeId: '',
        hireDate: '',
        qualification: '',
        specialization: '',
      })
    }
  }, [teacher, reset])

  return (
    <Card>
      <h2 className='text-xl font-semibold mb-6'>
        {isEditMode ? 'Edit Teacher' : 'Create New Teacher'}
      </h2>

      <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
        {/* User Selection - Only for create mode */}
        {!isEditMode && (
          <div>
            <label
              htmlFor='userId'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Select User <span className='text-red-500'>*</span>
            </label>
            <select
              id='userId'
              {...register('userId')}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border'
              disabled={isSubmitting}
            >
              <option value=''>-- Select a user --</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.userId.message}
              </p>
            )}
            <p className='mt-1 text-sm text-gray-500'>
              Select a user to associate with this teacher profile
            </p>
          </div>
        )}

        {/* Employee ID */}
        <div>
          <label
            htmlFor='employeeId'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Employee ID <span className='text-red-500'>*</span>
          </label>
          <Input
            id='employeeId'
            type='text'
            placeholder='e.g., EMP001'
            disabled={isSubmitting}
            {...register('employeeId')}
            className={errors.employeeId ? 'border-red-500' : ''}
          />
          {errors.employeeId && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.employeeId.message}
            </p>
          )}
        </div>

        {/* Hire Date */}
        <div>
          <label
            htmlFor='hireDate'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Hire Date <span className='text-red-500'>*</span>
          </label>
          <Input
            id='hireDate'
            type='date'
            disabled={isSubmitting}
            {...register('hireDate')}
            className={errors.hireDate ? 'border-red-500' : ''}
          />
          {errors.hireDate && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.hireDate.message}
            </p>
          )}
        </div>

        {/* Qualification */}
        <div>
          <label
            htmlFor='qualification'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Qualification
          </label>
          <Input
            id='qualification'
            type='text'
            placeholder='e.g., M.Ed, B.Sc, Ph.D.'
            disabled={isSubmitting}
            {...register('qualification')}
            className={errors.qualification ? 'border-red-500' : ''}
          />
          {errors.qualification && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.qualification.message}
            </p>
          )}
        </div>

        {/* Specialization */}
        <div>
          <label
            htmlFor='specialization'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Specialization
          </label>
          <Input
            id='specialization'
            type='text'
            placeholder='e.g., Mathematics, Science, English'
            disabled={isSubmitting}
            {...register('specialization')}
            className={errors.specialization ? 'border-red-500' : ''}
          />
          {errors.specialization && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.specialization.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className='flex justify-end space-x-4 pt-4'>
          <Button
            type='button'
            variant='outline'
            href='/admin/teachers'
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Update Teacher'
                : 'Create Teacher'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default TeacherForm
