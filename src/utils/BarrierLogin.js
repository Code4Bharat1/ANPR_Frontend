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
      // ✅ Call YOUR backend, not camera directly
      const res = await axios.post("/api/barrier/login");

      const token = res.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      // ✅ Store exactly like Postman format
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
