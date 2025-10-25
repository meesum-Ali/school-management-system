'use client'

import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      <div className='flex-1 flex flex-col'>
        <Navbar />
        <main className='flex-1 p-4 overflow-auto'>{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
