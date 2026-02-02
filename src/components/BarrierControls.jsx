"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function BarrierControls() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const actuateBarrier = async () => {
    setLoading(true);
    setMessage("");

    try {
      const storedToken =
        localStorage.getItem("TOKEN") ||
        localStorage.getItem("token") ||
        localStorage.getItem("Token");

      if (!storedToken) {
        throw new Error("Auth token not found. Please login first.");
      }

      // ✅ STRIP PREFIX
      const rawToken = storedToken.startsWith("Token ")
        ? storedToken.slice(6)
        : storedToken;

      const res = await api.post(
        "https://api-anpr.nexcorealliance.com/api/v1/barrier/actuate",
        {},
        {
          headers: {
            Authorization: `Token ${rawToken}`,
            "X-Camera-IP": "192.168.0.100",
          },
        },
      );

      setMessage(res.data?.message || "Action performed");
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#fff", color: "black" }}>
      <h2>Barrier Control</h2>

      <button
        className="bg-indigo-500 text-white p-2 px-4 rounded-xl"
        onClick={actuateBarrier}
        disabled={loading}
      >
        Entry UP
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
