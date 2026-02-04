"use client";

import axios from "axios";
import { useState } from "react";

export default function BarrierLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        `https://anpr.nexcorealliance.com/api/v1/auth/auth/login/`,
        // `${getCameraURL()}/api/v1/auth/login`,
        {
          username: "admin",
          password: "Admin@1923",
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Host: "192.168.0.100",
            "X-Alpha": "21",
            "X-Cue": "34db55e07f7b39df480284397f7f42ec",
            "X-Salt": "683239",
            // "X-Camera-IP": "192.168.0.100",
          },
        },
      );

      console.log(response);
      const token = response.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      localStorage.setItem("TOKEN", `Token ${token}`);
      localStorage.setItem("token", `Token ${token}`);
      localStorage.setItem("Token", `Token ${token}`);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleLogin} disabled={loading} style={styles.button}>
        {loading ? "Logging in..." : "GET TOKEN"}
      </button>

      {success && <p style={styles.success}>Token stored successfully ✅</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

/* ==========================
   STYLES
========================== */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "40px",
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
