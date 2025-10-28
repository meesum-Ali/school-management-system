// app/page.tsx
// Home page - redirect to dashboard if authenticated, otherwise show login button

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value || cookieStore.get('id_token')?.value

  // If authenticated, go to dashboard
  if (token) {
    redirect('/admin/dashboard')
  }

  // Show login page
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            School Management System
          </h1>
          <p className='text-gray-600 mb-8'>
            Please sign in to continue
          </p>
          <Link
            href='/auth/login'
            className='inline-block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition'
          >
            Sign In with Zitadel
          </Link>
        </div>
      </div>
    </div>
  )
}
