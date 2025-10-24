// frontend/pages/login.tsx
// Redirects to Zitadel for authentication

import React, { useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../contexts/AuthContext'

// Zitadel configuration
const ZITADEL_ISSUER = process.env.NEXT_PUBLIC_ZITADEL_ISSUER || 'http://localhost:8888'
const ZITADEL_CLIENT_ID = process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID
const ZITADEL_REDIRECT_URI = process.env.NEXT_PUBLIC_ZITADEL_REDIRECT_URI || 'http://localhost:3001/auth/callback'

// PKCE Helper Functions
const generateCodeVerifier = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

const generateCodeChallenge = async (verifier: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    console.log('=== LOGIN PAGE DEBUG ===')
    console.log('isAuthenticated:', isAuthenticated)
    console.log('ZITADEL_CLIENT_ID:', ZITADEL_CLIENT_ID)
    console.log('ZITADEL_ISSUER:', ZITADEL_ISSUER)
    console.log('========================')

    // Redirect if already authenticated
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard')
      router.push('/admin/dashboard')
      return
    }

    // Check if Zitadel is configured
    if (!ZITADEL_CLIENT_ID || ZITADEL_CLIENT_ID.trim() === '') {
      console.error('Zitadel CLIENT_ID not configured!')
      return
    }

    console.log('Starting Zitadel redirect...')

    // Redirect to Zitadel
    const initiateZitadelLogin = async () => {
      try {
        const codeVerifier = generateCodeVerifier()
        sessionStorage.setItem('code_verifier', codeVerifier)

        const codeChallenge = await generateCodeChallenge(codeVerifier)
        const state = Math.random().toString(36).substring(7)
        sessionStorage.setItem('oauth_state', state)

        const authUrl = new URL(`${ZITADEL_ISSUER}/oauth/v2/authorize`)
        authUrl.searchParams.append('client_id', ZITADEL_CLIENT_ID!)
        authUrl.searchParams.append('redirect_uri', ZITADEL_REDIRECT_URI)
        authUrl.searchParams.append('response_type', 'code')
        authUrl.searchParams.append('scope', 'openid profile email')
        authUrl.searchParams.append('state', state)
        authUrl.searchParams.append('code_challenge', codeChallenge)
        authUrl.searchParams.append('code_challenge_method', 'S256')

        console.log('Redirecting to:', authUrl.toString())
        window.location.href = authUrl.toString()
      } catch (error) {
        console.error('Redirect failed:', error)
      }
    }

    initiateZitadelLogin()
  }, [isAuthenticated, router])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900'>
      <div className='text-center'>
        <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mb-4'></div>
        <h2 className='text-2xl font-semibold text-gray-800 dark:text-white mb-2'>
          Redirecting to Login...
        </h2>
        <p className='text-gray-600 dark:text-gray-400'>
          Please wait while we redirect you to the authentication page.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
