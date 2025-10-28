// app/fe-api/[...path]/route.ts
// Server-side proxy to backend API that injects Authorization header from httpOnly cookies.

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Internal backend URL. Prefer explicit internal URL, else fall back to public API URL, else docker service.
const RAW_BACKEND_BASE =
  process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://backend:5000'

// Ensure we target the backend /api prefix regardless of the provided base
const BACKEND_BASE = /\/api$/.test(RAW_BACKEND_BASE)
  ? RAW_BACKEND_BASE
  : `${RAW_BACKEND_BASE}/api`

async function proxy(request: NextRequest, method: string) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('token')?.value || cookieStore.get('id_token')?.value

  // Build target URL (map /fe-api/* -> backend /api/*)
  const path = request.nextUrl.pathname.replace(/^\/fe-api\//, '')
  const search = request.nextUrl.search || ''
  const targetUrl = `${BACKEND_BASE}/${path}${search}`

  // Clone headers and inject Authorization
  const headers = new Headers()
  // Forward content-type for non-GET requests
  const incomingContentType = request.headers.get('content-type')
  if (incomingContentType) headers.set('content-type', incomingContentType)
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)

  // Forward body if needed
  let body: BodyInit | null = null
  if (method !== 'GET' && method !== 'HEAD') {
    const arrayBuffer = await request.arrayBuffer()
    body = arrayBuffer.byteLength ? (arrayBuffer as unknown as BodyInit) : null
  }

  const resp = await fetch(targetUrl, {
    method,
    headers,
    body,
    // Important: don’t forward cookies to backend; backend expects Authorization header
  })

  // Stream back response with original status and headers (minimal set)
  const data = await resp.arrayBuffer()
  const outHeaders = new Headers()
  // Pass through content-type to the client
  const respCT = resp.headers.get('content-type')
  if (respCT) outHeaders.set('content-type', respCT)
  // Helpful for troubleshooting
  outHeaders.set('x-upstream-status', String(resp.status))
  outHeaders.set('x-upstream-url', targetUrl)

  return new Response(data, { status: resp.status, headers: outHeaders })
}

export async function GET(request: NextRequest) {
  return proxy(request, 'GET')
}
export async function POST(request: NextRequest) {
  return proxy(request, 'POST')
}
export async function PUT(request: NextRequest) {
  return proxy(request, 'PUT')
}
export async function PATCH(request: NextRequest) {
  return proxy(request, 'PATCH')
}
export async function DELETE(request: NextRequest) {
  return proxy(request, 'DELETE')
}
