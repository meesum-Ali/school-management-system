import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

const Sidebar: React.FC = () => {
  const { user } = useContext(AuthContext);
  const userRoles = user?.roles || [];

  const canManageSchoolResources = userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.SUPER_ADMIN);
  const isSuperAdmin = userRoles.includes(UserRole.SUPER_ADMIN);

  // Remove "Teacher Management" as it's part of "User Management" now.
  // Add "Schools Management" for SUPER_ADMIN.

  return (
    <aside className='w-64 bg-white shadow-md p-4'>
      <h2 className='text-lg font-semibold mb-4'>Admin Panel {user?.schoolId && !isSuperAdmin ? `(${user.schoolId.substring(0,8)}...)` : ''}</h2>
      <nav>
        <ul>
          <li className='mb-2'>
            <Link href='/admin/dashboard' className='text-blue-500'>
              Dashboard
            </Link>
          </li>

          {isSuperAdmin && (
            <li className='mb-2'>
              <Link href='/admin/schools' className='text-blue-500'>
                Schools Management
              </Link>
            </li>
          )}

          {canManageSchoolResources && (
            <>
              <li className='mb-2'>
                <Link href='/admin/users' className='text-blue-500'>
                  User Management
                </Link>
              </li>
              <li className='mb-2'>
                <Link href='/admin/students' className='text-blue-500'>
                  Student Management
                </Link>
              </li>
              <li className='mb-2'>
                <Link href='/admin/classes' className='text-blue-500'>
                  Class Management
                </Link>
              </li>
              <li className='mb-2'>
                <Link href='/admin/subjects' className='text-blue-500'>
                  Subject Management
                </Link>
              </li>
            </>
          )}
          {/* Add more links as needed, checking roles */}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar;
