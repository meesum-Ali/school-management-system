import React from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Subject } from '../../types/subject'

interface SubjectListProps {
  subjects: Subject[]
  onDelete: (id: string) => void
}

const SubjectList: React.FC<SubjectListProps> = ({ subjects, onDelete }) => {
  return (
    <Card>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>Subject Management</h1>
        <Button href='/admin/subjects/create'>Create Subject</Button>
      </div>
      {subjects.length === 0 ? (
        <p>No subjects found.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Code
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Description
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Classes
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {subject.id.substring(0, 8)}...
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {subject.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {subject.code || 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs'>
                    {subject.description || 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {subject.classes?.length || 0}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-right'>
                    <Button
                      href={`/admin/subjects/${subject.id}`}
                      variant='outline'
                      size='sm'
                      className='mr-2'
                    >
                      Edit / View Classes
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => onDelete(subject.id)}
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

export default SubjectList
