import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center'>
        <h1 className='text-4xl font-bold text-red-600 mb-4'>403</h1>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
          Unauthorized Access
        </h2>
        <p className='text-gray-600 mb-6'>
          You don&apos;t have permission to access this page. Please contact
          your administrator if you believe this is an error.
        </p>
        <Link
          href='/'
          className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors'
        >
          Try again
        </Link>
      </div>
    </div>
  )
}
