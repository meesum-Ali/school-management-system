import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
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
import { Student, CreateStudentDto, UpdateStudentDto } from '../types/student';

const STUDENTS_API_PATH = '/students';

export const fetchStudents = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>(STUDENTS_API_PATH);
  return response.data;
};

export const fetchStudentById = async (id: string): Promise<Student> => {
  const response = await api.get<Student>(`${STUDENTS_API_PATH}/${id}`);
  return response.data;
};

export const createStudent = async (studentData: CreateStudentDto): Promise<Student> => {
  const response = await api.post<Student>(STUDENTS_API_PATH, studentData);
  return response.data;
};

export const updateStudent = async (id: string, studentData: UpdateStudentDto): Promise<Student> => {
  const response = await api.patch<Student>(`${STUDENTS_API_PATH}/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id: string): Promise<void> => {
  await api.delete(`${STUDENTS_API_PATH}/${id}`);
};

// User API functions
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

const USERS_API_PATH = '/users';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>(USERS_API_PATH);
  return response.data;
};

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`${USERS_API_PATH}/${id}`);
  return response.data;
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const response = await api.post<User>(USERS_API_PATH, userData);
  return response.data;
};

export const updateUser = async (id: string, userData: UpdateUserDto): Promise<User> => {
  const response = await api.patch<User>(`${USERS_API_PATH}/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`${USERS_API_PATH}/${id}`);
};
