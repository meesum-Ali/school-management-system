import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Class, CreateClassDto, UpdateClassDto } from '../../types/class';
// Assuming User type might be needed for a dropdown in future, not for simple UUID input
// import { User } from '../../types/user';

interface ClassFormProps {
  initialData?: Class; // For editing
  onSubmit: (data: CreateClassDto | UpdateClassDto) => void;
  isSubmitting?: boolean;
  // availableTeachers?: User[]; // For future teacher dropdown
}

// Yup schema for validation
const schema = yup.object().shape({
  name: yup.string().required('Class name is required').min(2, 'Class name must be at least 2 characters'),
  level: yup.string().required('Class level is required'),
  homeroomTeacherId: yup.string().uuid('Must be a valid UUID if provided').nullable().optional(),
});

const ClassForm: React.FC<ClassFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset, // To reset form with initialData
  } = useForm<CreateClassDto | UpdateClassDto>({
    resolver: yupResolver(schema) as Resolver<CreateClassDto | UpdateClassDto>,
    defaultValues: {
      name: initialData?.name || '',
      level: initialData?.level || '',
      homeroomTeacherId: initialData?.homeroomTeacherId || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        level: initialData.level,
        homeroomTeacherId: initialData.homeroomTeacherId || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<CreateClassDto | UpdateClassDto> = (data) => {
    const dataToSubmit = { ...data };
    // Ensure empty string for homeroomTeacherId is converted to null if that's desired by backend,
    // or ensure backend handles empty string appropriately if it means "no teacher".
    // The DTO allows string | null for update, and optional string for create.
    // If empty string means "remove teacher", backend service should handle it.
    // Or, explicitly set to null if field is empty and optional:
    if (dataToSubmit.homeroomTeacherId === '') {
        dataToSubmit.homeroomTeacherId = undefined; // Or null if DTO allows null for create
    }
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="w-full max-w-lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h2 className="text-2xl mb-4">{isEditing ? 'Edit Class' : 'Create New Class'}</h2>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium">Class Name</label>
          <Input id="name" type="text" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="level" className="block mb-1 font-medium">Level/Grade</label>
          <Input id="level" type="text" {...register('level')} className={errors.level ? 'border-red-500' : ''} />
          {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>}
        </div>

        <div>
          <label htmlFor="homeroomTeacherId" className="block mb-1 font-medium">Homeroom Teacher ID (Optional UUID)</label>
          <Input id="homeroomTeacherId" type="text" {...register('homeroomTeacherId')} placeholder="Enter UUID or leave blank" />
          {errors.homeroomTeacherId && <p className="text-red-500 text-sm mt-1">{errors.homeroomTeacherId.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Class' : 'Create Class')}
        </Button>
      </form>
    </Card>
  );
};

export default ClassForm;
