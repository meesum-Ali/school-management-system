import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <Navbar />
        <main className='flex-1 p-4 overflow-auto'>{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
