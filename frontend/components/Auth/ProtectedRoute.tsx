import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  roles?: string[]
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
  const { isAuthenticated, user } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (
      roles &&
      roles.length > 0 &&
      user?.role &&
      !roles.includes(user.role)
    ) {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, roles, user, router])

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export default ProtectedRoute
