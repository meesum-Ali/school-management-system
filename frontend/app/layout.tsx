import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/providers/auth-provider'
import ThemeProvider from '@/components/providers/theme-provider'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import '@/styles/globals.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Modern school management platform',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
      </head>
      <body>
        <ReactQueryProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
