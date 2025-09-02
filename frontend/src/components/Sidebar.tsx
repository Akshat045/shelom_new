'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  RectangleStackIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Dielines', href: '/dielines', icon: RectangleStackIcon },
    { name: 'Cartons', href: '/cartons', icon: ArchiveBoxIcon },
    { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon },
    { name: 'Usage Log', href: '/usage-log', icon: ChartBarIcon },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'Users', href: '/users', icon: UsersIcon });
  }

  return (
    <div className="fixed top-0 left-0 w-64 h-screen bg-white shadow-lg border-r border-slate-200 z-40">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Shelom Graphics</h2>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Icon */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-slate-100'
                }`}>
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-500'
                    }`}
                  />
                </div>
                
                {/* Navigation label */}
                <span className="flex-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section - User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;