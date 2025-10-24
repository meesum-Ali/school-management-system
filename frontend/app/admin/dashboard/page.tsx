'use client'

import AdminLayout from '@/components/Layout/AdminLayout'

// Force dynamic rendering (client-side only)
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
      {/* Add summary cards and other components here */}
    </AdminLayout>
  )
}
