import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  fetchSchoolById,
} from '@/lib/api'
import { CreateSchoolDto, UpdateSchoolDto } from '@/types/school'

export const schoolKeys = {
  all: ['schools'] as const,
  detail: (id: string) => ['schools', id] as const,
}

export function useSchools() {
  return useQuery({
    queryKey: schoolKeys.all,
    queryFn: fetchSchools,
  })
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => fetchSchoolById(id),
    enabled: !!id,
  })
}

export function useCreateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSchoolDto) => createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all })
    },
  })
}

export function useUpdateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchoolDto }) =>
      updateSchool(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all })
      queryClient.invalidateQueries({ queryKey: schoolKeys.detail(variables.id) })
    },
  })
}

export function useDeleteSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all })
    },
  })
}
