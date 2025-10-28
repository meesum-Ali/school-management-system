import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Teacher, CreateTeacherDto, UpdateTeacherDto } from '../types/teacher'

// Query keys for cache management
export const teacherKeys = {
  all: ['teachers'] as const,
  detail: (id: string) => ['teachers', id] as const,
}

/**
 * Fetch all teachers for the current school
 */
export function useTeachers(initialData?: Teacher[]) {
  return useQuery({
    queryKey: teacherKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Teacher[]>('/teachers')
      return data
    },
    initialData,
  })
}

/**
 * Fetch a single teacher by ID
 */
export function useTeacher(id: string) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Teacher>(`/teachers/${id}`)
      return data
    },
    enabled: !!id, // Only fetch if ID is provided
  })
}

/**
 * Create a new teacher
 */
export function useCreateTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateTeacherDto) => {
      const { data } = await api.post<Teacher>('/teachers', dto)
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch teachers list
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
    },
  })
}

/**
 * Update an existing teacher
 */
export function useUpdateTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateTeacherDto
    }) => {
      const { data } = await api.patch<Teacher>(`/teachers/${id}`, dto)
      return data
    },
    onSuccess: (data) => {
      // Invalidate both the list and the specific teacher
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(data.id) })
    },
  })
}

/**
 * Delete a teacher
 */
export function useDeleteTeacher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/teachers/${id}`)
    },
    onSuccess: () => {
      // Invalidate teachers list
      queryClient.invalidateQueries({ queryKey: teacherKeys.all })
    },
  })
}
