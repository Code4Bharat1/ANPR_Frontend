"use client";

import axios from "axios";
import { useState } from "react";

export default function BarrierLoginPage() {
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState(null);
  const [success, setSuccess] =
    useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await axios.post(
        "https://api-anpr.nexcorealliance.com/api/barrier/login",
      );

      if (!res.data?.success) {
        throw new Error(
          res.data?.message ||
            "Login failed",
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button
        onClick={handleLogin}
        disabled={loading}
        style={styles.button}
      >
        {loading
          ? "Logging in..."
          : "LOGIN BARRIER"}
      </button>

      {success && (
        <p style={styles.success}>
          Barrier login successful ✅
        </p>
      )}
      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginTop: "40px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
  },
  success: { color: "green" },
  error: { color: "red" },
};
