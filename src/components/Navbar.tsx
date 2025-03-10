import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, LogOut } from 'lucide-react';
import { useSignOut } from '@nhost/react';

export default function Navbar() {
  const navigate = useNavigate();
  const { signOut } = useSignOut();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Newspaper className="w-8 h-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              News Digest
            </span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-2">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}