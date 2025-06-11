import Link from 'next/link'
const Sidebar: React.FC = () => {
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
          {/* Link for Classes was already present, ensuring it's correct */}
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
          {/* Add more links as needed */}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
