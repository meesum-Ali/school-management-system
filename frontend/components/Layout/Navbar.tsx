import React from 'react';
import { Link } from 'react-router-dom'; // Changed import
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path if necessary

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">School Management System</Link> {/* Changed href to to */}
      </div>
      <nav>
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.username}</span>
            {/* Assuming logout() handles navigation after logout if needed */}
            <button onClick={logout} className="text-red-500">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-blue-500"> {/* Changed href to to */}
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
