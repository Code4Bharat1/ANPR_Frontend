"use client";

import axios from "axios";
import { useState } from "react";

/* ==========================
   DYNAMIC IP WITH FALLBACK
========================== */

const DEFAULT_IP = "192.168.0.100";

const getBaseURL = () => {
  if (typeof window === "undefined") {
    return `http://${DEFAULT_IP}`;
  }

  const savedIP = localStorage.getItem("API_IP");
  const ip = savedIP && savedIP.trim() !== "" ? savedIP : DEFAULT_IP;

  return `http://${ip}`;
};

export default function BarrierLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `https://api-anpr.nexcorealliance.com/api/v1/auth/login`,
        {
          username: "admin",
          password: "Admin@1923",
        },
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",

            "X-Alpha": "21",
            "X-Salt": "683239",
            "X-Cue": "34db55e07f7b39df480284397f7f42ec",
            "X-Camera-IP": "192.168.0.100",
          },
        },
      );

      console.log(res);

      const token = res.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      // ✅ Store EXACTLY like Postman (unchanged)
      localStorage.setItem("TOKEN", `Token ${token}`);
      localStorage.setItem("token", `Token ${token}`);
      localStorage.setItem("Token", `Token ${token}`);

      setSuccess(true);
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>GateGuard – Quick Login</h1>

      <button onClick={handleLogin} disabled={loading} style={styles.button}>
        {loading ? "Logging in..." : "GET TOKEN"}
      </button>

      {success && <p style={styles.success}>Token stored successfully ✅</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

/* ==========================
   STYLES (UNCHANGED)
========================== */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
  },
  success: {
    color: "green",
  },
  error: {
    color: "red",
  },
};
