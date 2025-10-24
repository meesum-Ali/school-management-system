import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchSubjectById,
} from '@/utils/api'
import { CreateSubjectDto, UpdateSubjectDto } from '@/types/subject'

export const subjectKeys = {
  all: ['subjects'] as const,
  detail: (id: string) => ['subjects', id] as const,
}

export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.all,
    queryFn: fetchSubjects,
  })
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: subjectKeys.detail(id),
    queryFn: () => fetchSubjectById(id),
    enabled: !!id,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubjectDto) => createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
    },
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectDto }) =>
      updateSubject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
      queryClient.invalidateQueries({ queryKey: subjectKeys.detail(variables.id) })
    },
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.all })
    },
  })
}
