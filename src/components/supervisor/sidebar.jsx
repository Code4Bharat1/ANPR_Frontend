"use client";

import React from 'react';
import { 
  LayoutDashboard,
  Video,
  Car,
  FileText,
  AlertCircle,
  Settings,
  Shield
} from 'lucide-react';
import Link from 'next/link';

const Sidebar = ({ activePage = 'dashboard' }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      href: '/supervisor/dashboard'
    },
    {
      id: 'live-monitor',
      label: 'Live Monitor',
      icon: 'video',
      href: '/supervisor/live-monitor'
    },
    {
      id: 'active-vehicles',
      label: 'Active Vehicles',
      icon: 'car',
      href: '/supervisor/active-vehicles'
    },
    {
      id: 'access-logs',
      label: 'Access Logs',
      icon: 'file',
      href: '/supervisor/access-logs'
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: 'alert',
      href: '/supervisor/incidents'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'chart',
      href: '/supervisor/analytics'
    }
  ];

  const renderIcon = (iconType) => {
    const iconClass = "w-5 h-5";
    
    switch(iconType) {
      case 'dashboard':
        return (
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
          </div>
        );
      case 'video':
        return <Video className={iconClass} />;
      case 'car':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 18.5a1.5 1.5 0 0 1-1 1.415V21a1 1 0 0 1-2 0v-1.085a1.5 1.5 0 0 1 0-2.83V3a1 1 0 0 1 2 0v14.085A1.5 1.5 0 0 1 18 18.5zM7 13.5a1.5 1.5 0 0 1-1 1.415V21a1 1 0 0 1-2 0v-6.085a1.5 1.5 0 0 1 0-2.83V3a1 1 0 0 1 2 0v9.085A1.5 1.5 0 0 1 7 13.5z"/>
          </svg>
        );
      case 'file':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'alert':
        return <AlertCircle className={iconClass} />;
      case 'chart':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      default:
        return <LayoutDashboard className={iconClass} />;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-screen">
      {/* Logo */}
      <Link href="/supervisor/dashboard" className="flex items-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <span className="font-semibold text-gray-900">SecureGate</span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activePage === item.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className={activePage === item.id ? 'text-white' : 'text-gray-600'}>
              {renderIcon(item.icon)}
            </div>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* System Settings */}
      <Link 
        href="/supervisor/settings"
        className="flex items-center gap-2 text-gray-600 text-sm mt-4 hover:text-gray-900 transition-colors"
      >
        <Settings className="w-5 h-5" />
        System Settings
      </Link>
    </div>
  );
};

export default Sidebar;