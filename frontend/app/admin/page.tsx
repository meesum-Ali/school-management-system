// app/admin/page.tsx
// Admin root - redirects to dashboard

import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/dashboard')
}
