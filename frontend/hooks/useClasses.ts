import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  fetchClassById,
} from '@/lib/api'
import { CreateClassDto, UpdateClassDto } from '@/types/class'

// Query keys
export const classKeys = {
  all: ['classes'] as const,
  detail: (id: string) => ['classes', id] as const,
}

// Fetch all classes
export function useClasses() {
  return useQuery({
    queryKey: classKeys.all,
    queryFn: fetchClasses,
  })
}

// Fetch single class
export function useClass(id: string) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => fetchClassById(id),
    enabled: !!id,
  })
}

// Create class mutation
export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClassDto) => createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    },
  })
}

// Update class mutation
export function useUpdateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassDto }) =>
      updateClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
      queryClient.invalidateQueries({
        queryKey: classKeys.detail(variables.id),
      })
    },
  })
}

// Delete class mutation
export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    },
  })
}
