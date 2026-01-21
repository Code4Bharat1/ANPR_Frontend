"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem("accessToken");

    // login page ko free rakho
    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [router, pathname]);

  return children;
}
