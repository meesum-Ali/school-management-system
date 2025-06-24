import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Class } from '../../types/class';

interface ClassListProps {
  classes: Class[];
  onDelete: (id: string) => void;
}

const ClassList: React.FC<ClassListProps> = ({ classes, onDelete }) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Class Management</h1>
        <Link href="/admin/classes/create" passHref>
          <Button>Create Class</Button>
        </Link>
      </div>
      {classes.length === 0 ? (
        <p>No classes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Homeroom Teacher ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((cls) => (
                <tr key={cls.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.id.substring(0,8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.homeroomTeacherId || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.subjects?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <Link href={`/admin/classes/${cls.id}`}>
                      <Button variant="outline" size="sm" className="mr-2">
                        Edit / View Subjects
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(cls.id)}
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
  );
};

export default ClassList;
