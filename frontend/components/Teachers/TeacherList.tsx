import React from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Teacher } from '../../types/teacher'

interface TeacherListProps {
  teachers: Teacher[]
  onDelete: (id: string) => void
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onDelete }) => {
  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  // Helper function to get full name
  const getFullName = (teacher: Teacher) => {
    if (teacher.user) {
      return `${teacher.user.firstName} ${teacher.user.lastName}`
    }
    return 'N/A'
  }

  // Helper function to get email
  const getEmail = (teacher: Teacher) => {
    return teacher.user?.email || 'N/A'
  }

  return (
    <Card>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>Teacher Management</h1>
        <Button href='/admin/teachers/create'>Add Teacher</Button>
      </div>

      {teachers.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-500 mb-4'>No teachers found.</p>
          <Button href='/admin/teachers/create' variant='outline'>
            Create Your First Teacher
          </Button>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Employee ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Hire Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Qualification
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Specialization
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {getFullName(teacher)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {getEmail(teacher)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {teacher.employeeId}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(teacher.hireDate)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {teacher.qualification || 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {teacher.specialization || 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-right'>
                    <Button
                      href={`/admin/teachers/${teacher.id}`}
                      variant='outline'
                      size='sm'
                      className='mr-2'
                    >
                      Edit
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => onDelete(teacher.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default TeacherList
