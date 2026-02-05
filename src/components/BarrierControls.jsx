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
        "http://192.168.0.100/api/v1/barrier/actuate",
        {},
        {
          headers: {
            Authorization: `Token ${rawToken}`,
            "X-Camera-IP": "192.168.0.100",
            Accept: "application/json",
            "Content-Type": "application/json",
            // Host: "192.168.0.100",
            "X-Alpha": "21",
            "X-Cue": "34db55e07f7b39df480284397f7f42ec",
            "X-Salt": "683239",
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
