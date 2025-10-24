import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../contexts/AuthContext';
import { UserRole } from '../../types/user';

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  children: React.ReactNode;
}

// Note: With Next.js middleware handling auth, this component is primarily for client-side
// role-based content protection within a page, not for route protection
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles, children }) => {
  const { isAuthenticated, user, isLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for authentication status to be resolved
    }

    if (!isAuthenticated) {
      router.push('/login');
    } else if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      (!user?.roles || !user.roles.some(role => requiredRoles.includes(role as UserRole)))
    ) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, user, requiredRoles, router, isLoading]);

  if (isLoading) {
    return <div>Loading Authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (
    requiredRoles &&
    requiredRoles.length > 0 &&
    (!user?.roles || !user.roles.some(role => requiredRoles.includes(role as UserRole)))
  ) {
    return <div>Redirecting to unauthorized...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
