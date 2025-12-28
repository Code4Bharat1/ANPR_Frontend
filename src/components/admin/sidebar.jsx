"use client";

import React, { useState } from "react";
import {
  Shield, LayoutDashboard, MapPin, Users, Camera,
  BarChart3, Settings, User, LogOut, Menu, X
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const Sidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Sites", icon: MapPin, path: "/admin/sites" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Devices", icon: Camera, path: "/admin/devices" },
    { name: "Reports", icon: BarChart3, path: "/admin/reports" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
    { name: "Profile", icon: User, path: "/admin/profile" },
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="text-white" />
              </div>
              <span className="text-xl font-bold">AccessControl</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2">
              <X />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  ${isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"}
                `}
              >
                <Icon className="w-5 h-5" />
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
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
