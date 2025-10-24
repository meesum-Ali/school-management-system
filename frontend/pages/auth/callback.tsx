// frontend/pages/auth/callback.tsx
// Handles OAuth callback from Zitadel

import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../../contexts/AuthContext'
import api from '../../utils/api'

const ZITADEL_ISSUER = process.env.NEXT_PUBLIC_ZITADEL_ISSUER || 'http://localhost:8888'
const ZITADEL_CLIENT_ID = process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID
const ZITADEL_REDIRECT_URI = process.env.NEXT_PUBLIC_ZITADEL_REDIRECT_URI || 'http://localhost:3001/auth/callback'

const AuthCallback: React.FC = () => {
  const router = useRouter()
  const { loadUserFromToken } = useContext(AuthContext) as any
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { code, state, error: oauthError } = router.query

        // Check for OAuth errors
        if (oauthError) {
          setError(`Authentication error: ${oauthError}`)
          setIsProcessing(false)
          return
        }

        // Verify we have the required parameters
        if (!code || !state) {
          setError('Missing authorization code or state')
          setIsProcessing(false)
          return
        }

        // Verify state matches (CSRF protection)
        const savedState = sessionStorage.getItem('oauth_state')
        if (state !== savedState) {
          setError('Invalid state parameter - possible CSRF attack')
          setIsProcessing(false)
          return
        }

        // Get code verifier for PKCE
        const codeVerifier = sessionStorage.getItem('code_verifier')
        if (!codeVerifier) {
          setError('Missing code verifier')
          setIsProcessing(false)
          return
        }

        // Exchange authorization code for tokens
        const tokenResponse = await fetch(`${ZITADEL_ISSUER}/oauth/v2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code as string,
            redirect_uri: ZITADEL_REDIRECT_URI,
            client_id: ZITADEL_CLIENT_ID || '',
            code_verifier: codeVerifier,
          }),
        })

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json()
          throw new Error(errorData.error_description || 'Token exchange failed')
        }

        const tokenData = await tokenResponse.json()
        const { access_token, id_token } = tokenData

        // Store tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', access_token)
          localStorage.setItem('id_token', id_token)
          
          // Set cookie with 7-day expiration
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + 7)
          document.cookie = `token=${access_token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`
          
          // Clear OAuth session data
          sessionStorage.removeItem('oauth_state')
          sessionStorage.removeItem('code_verifier')
        }

        // Set authorization header for API requests
        api.defaults.headers.Authorization = `Bearer ${access_token}`

        // Load user info from token
        if (loadUserFromToken) {
          loadUserFromToken(access_token)
        }

        // Redirect to dashboard
        router.push('/admin/dashboard')
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setIsProcessing(false)
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router, router.isReady, router.query, loadUserFromToken])

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6'>
          <div className='text-center'>
            <svg
              className='mx-auto h-12 w-12 text-red-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
            <h2 className='mt-4 text-2xl font-bold text-gray-900 dark:text-white'>
              Authentication Error
            </h2>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>{error}</p>
            <button
              onClick={() => router.push('/login')}
              className='mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <div className='text-center'>
        <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        <p className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
          {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}

export default AuthCallback
