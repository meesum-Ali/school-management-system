import axios from 'axios'
import config from '../lib/config' // Import config to use its apiUrl

const api = axios.create({
  baseURL: config.apiUrl, // Use the centralized apiUrl
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

// Student API functions
import { Student, CreateStudentDto, UpdateStudentDto } from '../types/student'

const STUDENTS_API_PATH = '/students'

export const fetchStudents = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>(STUDENTS_API_PATH)
  return response.data
}

export const fetchStudentById = async (id: string): Promise<Student> => {
  const response = await api.get<Student>(`${STUDENTS_API_PATH}/${id}`)
  return response.data
}

export const createStudent = async (
  studentData: CreateStudentDto,
): Promise<Student> => {
  const response = await api.post<Student>(STUDENTS_API_PATH, studentData)
  return response.data
}

export const updateStudent = async (
  id: string,
  studentData: UpdateStudentDto,
): Promise<Student> => {
  const response = await api.patch<Student>(
    `${STUDENTS_API_PATH}/${id}`,
    studentData,
  )
  return response.data
}

export const deleteStudent = async (id: string): Promise<void> => {
  await api.delete(`${STUDENTS_API_PATH}/${id}`)
}

// This function might be used by both student form and class details page for unenrollment
export const assignStudentToClassViaStudentApi = async (
  studentId: string,
  classId: string | null,
): Promise<Student> => {
  const response = await api.patch<Student>(
    `/students/${studentId}/assign-class`,
    { classId },
  )
  return response.data
}

// User API functions
import { User, CreateUserDto, UpdateUserDto } from '../types/user'

const USERS_API_PATH = '/users'

export const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>(USERS_API_PATH)
  return response.data
}

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`${USERS_API_PATH}/${id}`)
  return response.data
}

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const response = await api.post<User>(USERS_API_PATH, userData)
  return response.data
}

export const updateUser = async (
  id: string,
  userData: UpdateUserDto,
): Promise<User> => {
  const response = await api.patch<User>(`${USERS_API_PATH}/${id}`, userData)
  return response.data
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`${USERS_API_PATH}/${id}`)
}

// Class API functions
import { Class, CreateClassDto, UpdateClassDto } from '../types/class'
import { Subject as SubjectTypeForClassListing } from '../types/subject' // Changed alias

const CLASSES_API_PATH = '/classes'

export const fetchClasses = async (): Promise<Class[]> => {
  const response = await api.get<Class[]>(CLASSES_API_PATH)
  return response.data
}

export const fetchClassById = async (id: string): Promise<Class> => {
  const response = await api.get<Class>(`${CLASSES_API_PATH}/${id}`)
  return response.data
}

export const createClass = async (
  classData: CreateClassDto,
): Promise<Class> => {
  const response = await api.post<Class>(CLASSES_API_PATH, classData)
  return response.data
}

export const updateClass = async (
  id: string,
  classData: UpdateClassDto,
): Promise<Class> => {
  const response = await api.patch<Class>(
    `${CLASSES_API_PATH}/${id}`,
    classData,
  )
  return response.data
}

export const deleteClass = async (id: string): Promise<void> => {
  await api.delete(`${CLASSES_API_PATH}/${id}`)
}

export const assignSubjectToClass = async (
  classId: string,
  subjectId: string,
): Promise<Class> => {
  const response = await api.post<Class>(
    `${CLASSES_API_PATH}/${classId}/subjects/${subjectId}`,
  )
  return response.data
}

export const removeSubjectFromClass = async (
  classId: string,
  subjectId: string,
): Promise<Class> => {
  const response = await api.delete<Class>(
    `${CLASSES_API_PATH}/${classId}/subjects/${subjectId}`,
  )
  return response.data
}

export const listSubjectsForClass = async (
  classId: string,
): Promise<SubjectTypeForClassListing[]> => {
  const response = await api.get<SubjectTypeForClassListing[]>(
    `${CLASSES_API_PATH}/${classId}/subjects`,
  )
  return response.data
}

export const listStudentsInClass = async (
  classId: string,
): Promise<Student[]> => {
  const response = await api.get<Student[]>(
    `${CLASSES_API_PATH}/${classId}/students`,
  )
  return response.data
}

// Subject API functions
import { Subject, CreateSubjectDto, UpdateSubjectDto } from '../types/subject'
import { Class as ClassType } from '../types/class' // For listClassesForSubject

const SUBJECTS_API_PATH = '/subjects'

export const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await api.get<Subject[]>(SUBJECTS_API_PATH)
  return response.data
}

export const fetchSubjectById = async (id: string): Promise<Subject> => {
  const response = await api.get<Subject>(`${SUBJECTS_API_PATH}/${id}`)
  return response.data
}

export const createSubject = async (
  subjectData: CreateSubjectDto,
): Promise<Subject> => {
  const response = await api.post<Subject>(SUBJECTS_API_PATH, subjectData)
  return response.data
}

export const updateSubject = async (
  id: string,
  subjectData: UpdateSubjectDto,
): Promise<Subject> => {
  const response = await api.patch<Subject>(
    `${SUBJECTS_API_PATH}/${id}`,
    subjectData,
  )
  return response.data
}

export const deleteSubject = async (id: string): Promise<void> => {
  await api.delete(`${SUBJECTS_API_PATH}/${id}`)
}

export const listClassesForSubject = async (
  subjectId: string,
): Promise<ClassType[]> => {
  const response = await api.get<ClassType[]>(
    `${SUBJECTS_API_PATH}/${subjectId}/classes`,
  )
  return response.data
}

// --- Schools API ---
import { School, CreateSchoolDto, UpdateSchoolDto } from '../types/school'

const SCHOOLS_API_PATH = '/schools'

export const fetchSchools = async (): Promise<School[]> => {
  const response = await api.get<School[]>(SCHOOLS_API_PATH)
  return response.data
}

export const fetchSchoolById = async (id: string): Promise<School> => {
  const response = await api.get<School>(`${SCHOOLS_API_PATH}/${id}`)
  return response.data
}

export const createSchool = async (
  schoolData: CreateSchoolDto,
): Promise<School> => {
  const response = await api.post<School>(SCHOOLS_API_PATH, schoolData)
  return response.data
}

export const updateSchool = async (
  id: string,
  schoolData: UpdateSchoolDto,
): Promise<School> => {
  const response = await api.patch<School>(
    `${SCHOOLS_API_PATH}/${id}`,
    schoolData,
  )
  return response.data
}

export const deleteSchool = async (id: string): Promise<void> => {
  await api.delete(`${SCHOOLS_API_PATH}/${id}`)
}
