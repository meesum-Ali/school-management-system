// app/page.tsx
// Home page - middleware will redirect unauthenticated users to Zitadel
// Authenticated users will be redirected to dashboard

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  // If authenticated, go to dashboard
  if (token) {
    redirect('/admin/dashboard')
  }

  // If not authenticated, middleware will handle Zitadel redirect
  // This code won't actually render because middleware catches it first
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-semibold mb-4'>
          School Management System
        </h1>
        <p className='text-gray-600'>Redirecting to login...</p>
      </div>
    </div>
  )
}
