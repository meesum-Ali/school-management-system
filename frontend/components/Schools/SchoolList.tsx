import React from 'react';
import Link from 'next/link';
import { School } from '../../types/school';
import { Button } from '../ui/Button'; // Assuming Button component exists
import { Card } from '../ui/Card'; // Assuming Card component exists

interface SchoolListProps {
  schools: School[];
  onDelete: (id: string) => void;
}

const SchoolList: React.FC<SchoolListProps> = ({ schools, onDelete }) => {
  if (schools.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500">No schools found.</p>
        <div className="mt-4 text-center">
          <Button href="/admin/schools/create">
            Create New School
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Schools</h2>
        <Button href="/admin/schools/create">
          Create New School
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin User ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schools.map((school) => (
              <tr key={school.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.domain || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.adminUserId || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button href={`/admin/schools/${school.id}`} variant="outline" size="sm" className="mr-2">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(school.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SchoolList;
