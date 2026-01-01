"use client";

import React from "react";
import {
  Shield, LayoutDashboard, Users, Camera, BarChart3, 
  FileText, Settings, User, LogOut, X , Bell
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Server } from 'lucide-react'; // Add this

const Sidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/superadmin/dashboard" },
    { name: "Clients", icon: Users, path: "/superadmin/clients" },
    { name: "Devices", icon: Camera, path: "/superadmin/devices" },
    { name: "Analytics", icon: BarChart3, path: "/superadmin/analytics" },
    { name: "Audit Logs", icon: FileText, path: "/superadmin/audit-logs" },
    // { icon: Bell, name: "Notifications", path: "/superadmin/notifications" },
    // { icon: Server, name: "Server Setup", path: "/superadmin/server-setup" },
    // { name: "Settings", icon: Settings, path: "/superadmin/settings" },
    // { name: "Profile", icon: User, path: "/superadmin/profile" },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("accessToken");
      router.replace("/login");
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          w-72 flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b">
        

          {/* Super Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              SA
            </div>
            <div>
              <div className="font-semibold text-gray-900">Super Admin</div>
              <div className="text-sm text-gray-500">System Administrator</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${isActive
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-700' : 'text-gray-600'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
          <div className="mt-4 text-center text-xs text-gray-400">
            v2.4.1 Super Admin Panel
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;