import Link from 'next/link'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

const Sidebar: React.FC = () => {
  const { user } = useContext(AuthContext)
  console.log(user)
  return (
    <aside className='w-64 bg-white shadow-md p-4'>
      <h2 className='text-lg font-semibold mb-4'>Admin Panel</h2>
      <nav>
        <ul>
          <li className='mb-2'>
            <Link href='/admin/dashboard' className='text-blue-500'>
              Dashboard
            </Link>
          </li>
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
            <Link href='/admin/teachers' className='text-blue-500'>
              Teacher Management
            </Link>
          </li>
          <li className='mb-2'>
            <Link href='/admin/classes' className='text-blue-500'>
              Class Management
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar