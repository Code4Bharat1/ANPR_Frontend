"use client";
import { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';

const SuperAdminLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
