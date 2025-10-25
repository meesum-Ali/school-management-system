// app/admin/layout.tsx
// Layout wrapper for all /admin routes

import AdminLayout from '@/components/Layout/AdminLayout'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
