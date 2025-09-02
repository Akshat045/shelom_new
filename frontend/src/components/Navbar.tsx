'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-64 right-0 bg-white/90 backdrop-blur-xl shadow-lg border-b border-slate-200/40 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand Section */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-sm tracking-wide">SG</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Shelom Graphics
                </h1>
                <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right Section - User Info & Actions */}
          <div className="flex items-center space-x-6">
            {/* User Profile Section */}
            <div className="flex items-center space-x-4 px-5 py-2.5 bg-gradient-to-r from-slate-50/90 to-slate-100/90 backdrop-blur-sm rounded-2xl border border-slate-200/60">
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-inner">
                  <UserIcon className="h-5 w-5 text-slate-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {user?.name || 'User'}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                    {user?.role || 'Member'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="group flex items-center space-x-3 px-5 py-2.5 text-slate-600 hover:text-slate-800 bg-white/60 hover:bg-white/80 rounded-2xl border border-slate-200/50 hover:border-slate-300/60 transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="p-1 rounded-lg bg-slate-100/80 group-hover:bg-slate-200/80 transition-all duration-200">
                <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom border animation */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </nav>
  );
};

export default Navbar;