import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  requiredRoles?: string[]
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles, children }) => {
  const { isAuthenticated, user } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      user?.roles &&
      !user.roles.some(role => requiredRoles.includes(role))
    ) {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, requiredRoles, user, router])

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export default ProtectedRoute
