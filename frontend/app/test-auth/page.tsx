// app/test-auth/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TestAuthPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get cookies from document
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    if (cookies.token || cookies.id_token) {
      try {
        const token = cookies.id_token || cookies.token
        // Decode JWT manually (base64)
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          setTokenInfo(payload)
        }
      } catch (err: any) {
        setError(err.message)
      }
    } else {
      setError('No auth tokens found in cookies')
    }
    setLoading(false)
  }, [])

  if (loading) return <div className='p-8'>Loading...</div>

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Authentication Test Page</h1>

      {error && (
        <div className='mb-6 p-4 bg-red-100 border border-red-400 rounded'>
          <p className='text-red-700'>
            <strong>Error:</strong> {error}
          </p>
          <p className='mt-2 text-sm'>
            This usually means you need to login first.
          </p>
          <Link href='/' className='text-blue-600 underline'>
            Go to Home to Login
          </Link>
        </div>
      )}

      {tokenInfo && (
        <>
          <div className='mb-6 p-4 bg-green-100 border border-green-400 rounded'>
            <p className='text-green-700'>
              <strong>✓ Authenticated!</strong>
            </p>
            <p className='text-sm'>Token found and decoded successfully.</p>
          </div>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-2'>User Information</h2>
            <ul className='list-disc pl-6'>
              <li>
                <strong>Subject:</strong> {tokenInfo.sub}
              </li>
              <li>
                <strong>Email:</strong> {tokenInfo.email || 'N/A'}
              </li>
              <li>
                <strong>Username:</strong>{' '}
                {tokenInfo.preferred_username || tokenInfo.username || 'N/A'}
              </li>
            </ul>
          </div>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-2'>Roles</h2>
            <div className='p-4 bg-gray-100 rounded'>
              <pre className='text-sm overflow-auto'>
                {JSON.stringify(
                  tokenInfo['urn:zitadel:iam:org:project:roles'] ||
                    'No roles found',
                  null,
                  2,
                )}
              </pre>
            </div>
            {!tokenInfo['urn:zitadel:iam:org:project:roles'] && (
              <p className='mt-2 text-red-600 font-semibold'>
                ⚠️ No roles assigned! You need SUPER_ADMIN or SCHOOL_ADMIN role
                to access /admin routes.
              </p>
            )}
          </div>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-2'>Full Token Payload</h2>
            <pre className='bg-gray-100 p-4 rounded overflow-auto text-xs'>
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>

          <div className='mt-6'>
            <Link
              href='/admin/dashboard'
              className='inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4'
            >
              Try Admin Dashboard
            </Link>
            <Link href='/' className='text-blue-600 underline'>
              Go to Home
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
