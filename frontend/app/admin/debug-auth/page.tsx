'use client'

import { useContext } from 'react'
import { AuthContext } from '@/components/providers/auth-provider'
import { Card, Typography, Box, Chip } from '@mui/material'

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Debug
      </Typography>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Authentication Status
        </Typography>
        <Typography>
          <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
        </Typography>
        <Typography>
          <strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </Typography>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        {user ? (
          <>
            <Typography>
              <strong>User ID:</strong> {user.id}
            </Typography>
            <Typography>
              <strong>Username:</strong> {user.username}
            </Typography>
            <Typography>
              <strong>School ID:</strong> {user.schoolId || 'None'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <strong>Roles:</strong>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      color={
                        role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  ))
                ) : (
                  <Typography color="error">No roles assigned</Typography>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Typography color="error">No user data available</Typography>
        )}
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Token Information
        </Typography>
        <Typography>
          <strong>Token in LocalStorage:</strong>{' '}
          {typeof window !== 'undefined' && localStorage.getItem('token')
            ? '✅ Present'
            : '❌ Missing'}
        </Typography>
      </Card>

      <Card sx={{ p: 3, mt: 2, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          Sidebar Visibility Requirements
        </Typography>
        <Typography>
          For <strong>Teachers</strong> and <strong>Students</strong> links to appear:
        </Typography>
        <ul>
          <li>User must be authenticated ✓</li>
          <li>User must have SCHOOL_ADMIN or SUPER_ADMIN role</li>
          <li>Click on "User Management" group to expand it</li>
        </ul>
      </Card>
    </Box>
  )
}
