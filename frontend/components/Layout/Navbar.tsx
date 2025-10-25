'use client';

import React from 'react';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '@/components/providers/auth-provider';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/">School Management System</Link>
      </div>
      <nav>
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.username}</span>
            <a href="/auth/logout" className="text-red-500">
              Logout
            </a>
          </div>
        ) : (
          <Link href="/" className="text-blue-500">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
