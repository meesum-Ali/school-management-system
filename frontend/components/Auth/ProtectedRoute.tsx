import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path if necessary due to src/
import { UserRole } from '../../types/user'; // Adjust path if necessary

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles, children }) => {
  const { isAuthenticated, user, isLoading } = useContext(AuthContext); // Assuming AuthContext provides isLoading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for authentication status to be resolved
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    } else if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      (!user?.roles || !user.roles.some(role => requiredRoles.includes(role as UserRole)))
    ) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, user, requiredRoles, navigate, isLoading, location]);

  if (isLoading) {
    return <div>Loading Authentication...</div>; // Or a global spinner
  }

  if (!isAuthenticated) {
    // This case should ideally be caught by the useEffect redirect,
    // but as a fallback or for initial render before effect.
    return <div>Redirecting to login...</div>;
  }

  if (
    requiredRoles &&
    requiredRoles.length > 0 &&
    (!user?.roles || !user.roles.some(role => requiredRoles.includes(role as UserRole)))
  ) {
    // This case should ideally be caught by the useEffect redirect.
    return <div>Redirecting to unauthorized...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
