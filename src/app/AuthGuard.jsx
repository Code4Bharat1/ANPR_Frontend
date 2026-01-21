"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Sirf client side pe hi check kare
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      const isPublicPath = ["/login", "/register", "/forgot-password"].includes(pathname);

      if (!accessToken && !isPublicPath) {
        router.replace("/login");
      }
      
      if (accessToken && pathname === "/login") {
        router.replace("/admin/dashboard");
      }
    }
  }, [router, pathname]);

  // Server-side rendering ke liye kuch nahi dikhaye
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}