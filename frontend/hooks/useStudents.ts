import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  fetchStudentById,
} from '@/lib/api'
import { CreateStudentDto, UpdateStudentDto } from '@/types/student'

export const studentKeys = {
  all: ['students'] as const,
  detail: (id: string) => ['students', id] as const,
}

export function useStudents() {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: fetchStudents,
  })
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => fetchStudentById(id),
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentDto) => createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentDto }) =>
      updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all })
    },
  })
}
