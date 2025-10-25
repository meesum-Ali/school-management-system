// app/debug-token/page.tsx
// Debug page to show token contents

import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'
import Link from 'next/link'

export default async function DebugTokenPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('token')?.value
  const idToken = cookieStore.get('id_token')?.value

  if (!accessToken && !idToken) {
    return (
      <div className='p-8'>
        <h1 className='text-2xl font-bold mb-4'>No Token Found</h1>
        <p>You are not logged in.</p>
        <Link href='/' className='text-blue-600 underline'>
          Go to Home
        </Link>
      </div>
    )
  }

  const token = idToken || accessToken
  const decoded = jwtDecode(token!) as any

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Token Debug Information</h1>

      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Token Type</h2>
        <p>{idToken ? 'ID Token' : 'Access Token'}</p>
      </div>

      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Decoded Token</h2>
        <pre className='bg-gray-100 p-4 rounded overflow-auto text-sm'>
          {JSON.stringify(decoded, null, 2)}
        </pre>
      </div>

      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Roles Claim</h2>
        <pre className='bg-gray-100 p-4 rounded overflow-auto text-sm'>
          {JSON.stringify(
            decoded['urn:zitadel:iam:org:project:roles'] ||
              'No roles claim found',
            null,
            2,
          )}
        </pre>
      </div>

      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>All Claims</h2>
        <ul className='list-disc pl-6'>
          {Object.keys(decoded).map((key) => (
            <li key={key}>
              <strong>{key}:</strong>{' '}
              {typeof decoded[key] === 'object'
                ? JSON.stringify(decoded[key])
                : String(decoded[key])}
            </li>
          ))}
        </ul>
      </div>

      <Link href='/' className='text-blue-600 underline'>
        Go to Home
      </Link>
    </div>
  )
}
