"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function LiveAnpr() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    socket.on("anpr:new-event", (data) => {
      console.log("New ANPR Event:", data);
      setEvents((prev) => [data, ...prev]);
    });

    return () => socket.off("anpr:new-event");
  }, []);

  return (
    <div>
      <h2>Live ANPR Feed</h2>
      {events.map((e) => (
        <div key={e._id}>
          <b>{e.numberPlate}</b> - {e.isEntry ? "ENTRY" : "EXIT"}
        </div>
      ))}
    </div>
  );
}
