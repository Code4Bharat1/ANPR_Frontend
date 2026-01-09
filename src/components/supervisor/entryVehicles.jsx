"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://webhooks.nexcorealliance.com"; // Use backend URL

export default function LiveAnpr() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    // ✅ Connection success
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      setStatus("connected");
    });

    // ❌ Connection error
    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err);
      setStatus("error");
    });

    // ❌ Disconnected
    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
      setStatus("disconnected");
    });

    // 🔴 Real-time event
    socket.on("anpr:new-event", (data) => {
      console.log("🚗 New ANPR Event:", data);
      setEvents((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Live ANPR Feed</h2>

      <p>
        Socket Status:{" "}
        <b
          style={{
            color:
              status === "connected"
                ? "green"
                : status === "error"
                ? "red"
                : "orange",
          }}
        >
          {status}
        </b>
      </p>

      {events.length === 0 && <p>No events yet...</p>}

      {events.map((e) => (
        <div key={e._id}>
          <b>{e.numberPlate}</b> – {e.isEntry ? "ENTRY" : "EXIT"}
        </div>
      ))}
    </div>
  );
}
