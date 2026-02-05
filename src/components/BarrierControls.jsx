"use client";

import { useState } from "react";
import axios from "axios";

export default function BarrierControls() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const openBarrier = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "https://api-anpr.nexcorealliance.com/api/barrier/open"
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Barrier open failed");
      }

      setMessage(res.data.message);
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
        onClick={openBarrier}
        disabled={loading}
      >
        {loading ? "Opening..." : "OPEN BARRIER"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
