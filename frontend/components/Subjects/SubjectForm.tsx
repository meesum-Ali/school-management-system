import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Textarea'; // Assuming a Textarea component exists
import { Subject, CreateSubjectDto, UpdateSubjectDto } from '../../types/subject';

interface SubjectFormProps {
  initialData?: Subject; // For editing
  onSubmit: (data: CreateSubjectDto | UpdateSubjectDto) => void;
  isSubmitting?: boolean;
}

// Yup schema for validation
const schema = yup.object().shape({
  name: yup.string().required('Subject name is required').min(2, 'Name must be at least 2 characters'),
  code: yup.string().optional().nullable().min(3, 'Code must be at least 3 characters if provided'),
  description: yup.string().optional().nullable(),
});

const SubjectForm: React.FC<SubjectFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSubjectDto | UpdateSubjectDto>({
    resolver: yupResolver(schema) as Resolver<CreateSubjectDto | UpdateSubjectDto>,
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code || '',
        description: initialData.description || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<CreateSubjectDto | UpdateSubjectDto> = (data) => {
    const dataToSubmit = { ...data };
    // Ensure empty strings for optional fields are converted to undefined or null as per DTO/backend expectation
    if (dataToSubmit.code === '') dataToSubmit.code = undefined; // Or null if DTO allows null
    if (dataToSubmit.description === '') dataToSubmit.description = undefined; // Or null
    onSubmit(dataToSubmit);
  };

  return (
    <Card className="w-full max-w-lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h2 className="text-2xl mb-4">{isEditing ? 'Edit Subject' : 'Create New Subject'}</h2>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium">Subject Name</label>
          <Input id="name" type="text" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="code" className="block mb-1 font-medium">Code (Optional)</label>
          <Input id="code" type="text" {...register('code')} className={errors.code ? 'border-red-500' : ''} />
          {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-medium">Description (Optional)</label>
          <Textarea id="description" {...register('description')} rows={4} className={errors.description ? 'border-red-500' : ''} />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Subject' : 'Create Subject')}
        </Button>
      </form>
    </Card>
  );
};

export default SubjectForm;
