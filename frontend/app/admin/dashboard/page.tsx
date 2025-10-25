'use client'

// Force dynamic rendering (client-side only)
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-gray-500 text-sm font-medium'>Total Students</h3>
          <p className='text-3xl font-bold text-blue-600 mt-2'>0</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-gray-500 text-sm font-medium'>Total Classes</h3>
          <p className='text-3xl font-bold text-green-600 mt-2'>0</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-gray-500 text-sm font-medium'>Total Teachers</h3>
          <p className='text-3xl font-bold text-purple-600 mt-2'>0</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-gray-500 text-sm font-medium'>Total Schools</h3>
          <p className='text-3xl font-bold text-orange-600 mt-2'>0</p>
        </div>
      </div>
    </div>
  )
}
