"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck, CheckCircle2, XCircle, Users, RefreshCw,
  ImageIcon, ChevronDown, Search, Clock, Calendar,
  TrendingUp, AlertTriangle, X, Loader2, Play, BarChart3,
  Filter, Activity
} from "lucide-react";
import Sidebar from "./sidebar";
import Header from "./header";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = false;
const PHOTO_API = `${API_URL}/api/uploads/get-file`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const isValidKey = (key) => {
  if (!key || typeof key !== "string") return false;
  if (/^[a-f0-9]{24}$/.test(key)) return false;
  if (!key.includes("/")) return false;
  return true;
};

function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  switch (period) {
    case "today":       start.setHours(0, 0, 0, 0); break;
    case "last7days":   start.setDate(start.getDate() - 7); break;
    case "last30days":  start.setDate(start.getDate() - 30); break;
    case "last90days":  start.setDate(start.getDate() - 90); break;
    case "last120days": start.setDate(start.getDate() - 120); break;
    case "alltime":     start.setFullYear(2000); break;
    default:            start.setDate(start.getDate() - 30); break;
  }
  return { startDate: start.toISOString(), endDate: now.toISOString() };
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_VENDORS = [
  { _id: "v1", name: "Sharma Logistics" },
  { _id: "v2", name: "Patel Transport" },
];
const MOCK_TRIPS = [
  { _id: "t1", tripId: "TRP-001", vehicleNumber: "MH04AB1234", vehicleType: "TRUCK", vendor: "Sharma Logistics", driver: "Ramesh Kumar", entryTime: "07 Mar 2025, 09:10 AM", exitTime: "07 Mar 2025, 11:45 AM", duration: "2h 35m", status: "EXITED", entryMedia: { photos: { frontView: "vehicles/v1/entry/photo-1.jpg", backView: "vehicles/v1/entry/photo-2.jpg" }, video: null }, exitMedia: { photos: { frontView: "vehicles/v1/exit/photo-1.jpg" }, video: "vehicles/v1/exit/video.mp4" } },
  { _id: "t2", tripId: "TRP-002", vehicleNumber: "GJ05CD5678", vehicleType: "TRUCK", vendor: "Patel Transport", driver: "Suresh Patel", entryTime: "07 Mar 2025, 10:00 AM", exitTime: "--", duration: "Ongoing", status: "INSIDE", entryMedia: { photos: {}, video: null }, exitMedia: { photos: {}, video: null } },
];

// ─── STATUS MAP ───────────────────────────────────────────────────────────────
const STATUS_MAP = {
  INSIDE:    { label: "Active",    bg: "#ecfdf5", color: "#059669", dot: "#059669", border: "#a7f3d0" },
  active:    { label: "Active",    bg: "#ecfdf5", color: "#059669", dot: "#059669", border: "#a7f3d0" },
  EXITED:    { label: "Completed", bg: "#eff6ff", color: "#2563eb", dot: "#2563eb", border: "#bfdbfe" },
  completed: { label: "Completed", bg: "#eff6ff", color: "#2563eb", dot: "#2563eb", border: "#bfdbfe" },
  DENIED:    { label: "Denied",    bg: "#fef2f2", color: "#dc2626", dot: "#dc2626", border: "#fecaca" },
  denied:    { label: "Denied",    bg: "#fef2f2", color: "#dc2626", dot: "#dc2626", border: "#fecaca" },
  overstay:  { label: "Overstay",  bg: "#fff7ed", color: "#ea580c", dot: "#ea580c", border: "#fed7aa" },
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const s = STATUS_MAP[status] || { label: status || "—", bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af", border: "#e5e7eb" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      padding: "4px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      border: `1px solid ${s.border}`, letterSpacing: "0.03em"
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${s.bg}` }} />
      {s.label}
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ Icon, label, value, iconBg, iconColor, trend }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "18px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
      border: "1px solid #f0f0f0",
      display: "flex", alignItems: "center", gap: 12,
      position: "relative", overflow: "hidden",
      transition: "transform .15s, box-shadow .15s",
      width: "100%", boxSizing: "border-box"
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)"; }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 14px 0 80px", background: iconBg, opacity: 0.5 }} />
      <div style={{ width: 46, height: 46, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div style={{ position: "relative" }}>
        <p style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</p>
        <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 3, fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

// ─── PHOTO MODAL ─────────────────────────────────────────────────────────────
function PhotoModal({ trip, onClose }) {
  const [tab, setTab]           = useState("entry");
  const [urlMap, setUrlMap]     = useState({});
  const [fetching, setFetching] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const token = () => localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

  const getSignedUrl = async (key) => {
    const routes = [
      `${API_URL}/api/uploads/get-file?key=${encodeURIComponent(key)}`,
      `${API_URL}/api/upload/get-file?key=${encodeURIComponent(key)}`,
      `${API_URL}/api/media/signed-url?key=${encodeURIComponent(key)}`,
    ];
    for (const route of routes) {
      try {
        const r = await fetch(route, { headers: { Authorization: `Bearer ${token()}` } });
        if (r.ok) {
          const d = await r.json();
          const url = d.url || d.signedUrl || d.downloadUrl || d.data?.url;
          if (url) return url;
        }
      } catch {}
    }
    return null;
  };

  const getMediaKeys = useCallback((t) => {
    const media = t === "entry" ? trip.entryMedia : trip.exitMedia;
    const photoKeys = Object.entries(media?.photos || {})
      .filter(([, v]) => isValidKey(v))
      .map(([label, key]) => ({ label, key, type: "image" }));
    const videoKey = isValidKey(media?.video)
      ? [{ label: "Video", key: media.video, type: "video" }]
      : [];
    return [...photoKeys, ...videoKey];
  }, [trip]);

  useEffect(() => {
    const items = getMediaKeys(tab);
    if (items.length === 0) return;
    const unfetched = items.filter(i => !urlMap[i.key]);
    if (unfetched.length === 0) return;
    setFetching(true);
    Promise.all(unfetched.map(async (item) => {
      const url = await getSignedUrl(item.key);
      return { key: item.key, url };
    })).then(results => {
      const newMap = { ...urlMap };
      results.forEach(r => { if (r.url) newMap[r.key] = r.url; });
      setUrlMap(newMap);
      setFetching(false);
    });
  }, [tab]);

  const items = getMediaKeys(tab);
  const LABELS = { frontView: "Front", backView: "Back", loadView: "Load", driverView: "Driver" };

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(.96) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
      `}</style>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)", animation: "backdropIn .2s ease" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 680, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,.25)", animation: "modalIn .25s ease" }}>

          {/* Modal Header */}
          <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(124,58,237,.3)" }}>
                <ImageIcon size={17} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Trip Media</p>
                <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginTop: 1 }}>{trip.vehicleNumber} • {trip.tripId}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
              <X size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, padding: "12px 22px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
            {[
              { key: "entry", label: "Entry Media", Icon: Truck },
              { key: "exit",  label: "Exit Media",  Icon: CheckCircle2 },
            ].map(({ key, label, Icon: I }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: "7px 18px", borderRadius: 10, cursor: "pointer",
                fontSize: 12.5, fontWeight: 600,
                border: tab === key ? "none" : "1px solid #e2e8f0",
                background: tab === key ? "linear-gradient(135deg, #7c3aed, #9333ea)" : "#fff",
                color: tab === key ? "#fff" : "#64748b",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all .15s",
                boxShadow: tab === key ? "0 4px 10px rgba(124,58,237,.25)" : "none"
              }}>
                <I size={12} /> {label}
              </button>
            ))}
          </div>

          {/* Media Grid */}
          <div style={{ padding: 18, overflowY: "auto", flex: 1 }}>
            {fetching ? (
              <div style={{ textAlign: "center", padding: 56, color: "#94a3b8" }}>
                <Loader2 size={28} color="#7c3aed" style={{ animation: "spin .7s linear infinite", margin: "0 auto 12px", display: "block" }} />
                <p style={{ fontSize: 13 }}>Loading media…</p>
              </div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: "center", padding: 56, color: "#94a3b8" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <ImageIcon size={26} color="#cbd5e1" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>No media available</p>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>No {tab} photos or videos found</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
                {items.map(({ label, key, type }) => {
                  const url = urlMap[key];
                  const displayLabel = LABELS[label] || label;
                  return (
                    <div key={key} onClick={() => url && setLightbox({ src: url, type })}
                      style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc", aspectRatio: type === "video" ? "16/9" : "4/3", position: "relative", cursor: url ? "pointer" : "default", transition: "transform .15s, box-shadow .15s" }}
                      onMouseEnter={e => { if (url) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,.12)"; }}}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                      <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, zIndex: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        {type === "video" && <Play size={8} fill="#fff" />}
                        {displayLabel}
                      </span>
                      {url ? (
                        type === "video"
                          ? <video src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                          : <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#cbd5e1" }}>
                          <Loader2 size={20} style={{ animation: "spin .7s linear infinite" }} />
                        </div>
                      )}
                      {url && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(124,58,237,.35)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .15s" }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, background: "rgba(0,0,0,.3)", padding: "6px 14px", borderRadius: 20, backdropFilter: "blur(4px)" }}>{type === "video" ? "▶ Play" : "⊕ View"}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.96)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {lightbox.type === "video"
            ? <video src={lightbox.src} controls autoPlay style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 10 }} onClick={e => e.stopPropagation()} />
            : <img src={lightbox.src} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 10 }} />
          }
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "#fff", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function VendorTripAnalytics() {
  const [vendors, setVendors]               = useState([]);
  const [trips, setTrips]                   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [period, setPeriod]                 = useState("last30days");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [search, setSearch]                 = useState("");
  const [selectedTrip, setSelectedTrip]     = useState(null);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  const token = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") || "";

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || localStorage.getItem("userData") || sessionStorage.getItem("user") || "{}"); }
    catch { return {}; }
  };

  // Fetch vendors
  useEffect(() => {
    if (USE_MOCK) { setVendors(MOCK_VENDORS); return; }
    const user = getUser();
    const params = new URLSearchParams();
    if (user?.clientId) params.set("clientId", user.clientId);
    fetch(`${API_URL}/api/project/vendors?${params}`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(d => { console.log("Vendor API response:", d); setVendors(d); })
      .catch(err => console.log(err));
  }, []);

  // Fetch trips
  const fetchTrips = useCallback(async () => {
    if (USE_MOCK) { setLoading(true); setTimeout(() => { setTrips(MOCK_TRIPS); setLoading(false); }, 400); return; }
    setLoading(true); setError(null);
    const user = getUser();
    const siteId   = user?.siteId   || user?.site?._id  || "";
    const clientId = user?.clientId || user?.client?._id || "";
    const { startDate, endDate } = getDateRange(period);
    const params = new URLSearchParams({ period, startDate, endDate });
    if (siteId)                   params.set("siteId",       siteId);
    if (clientId)                 params.set("clientId",     clientId);
    if (selectedVendor !== "all") params.set("vendorId",     selectedVendor);
    if (statusFilter   !== "all") params.set("status",       statusFilter);
    if (search.trim())            params.set("vehicleNumber",search.trim());
    try {
      const res = await fetch(`${API_URL}/api/trips/history?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) { setError(`API ${res.status}`); setTrips([]); return; }
      const data = await res.json();
      setTrips(data.data || data.trips || []);
    } catch (e) {
      setError(`Network error: ${e.message}`);
      setTrips([]);
    } finally { setLoading(false); }
  }, [selectedVendor, period, statusFilter, search]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // Stats
  const total  = trips.length;
  const inside = trips.filter(t => ["active","INSIDE"].includes(t.status)).length;
  const exited = trips.filter(t => ["completed","EXITED"].includes(t.status)).length;
  const denied = trips.filter(t => ["denied","DENIED"].includes(t.status)).length;

  const vendorBreakdown = trips.reduce((a, t) => { const v = t.vendor || "Unknown"; a[v] = (a[v]||0)+1; return a; }, {});
  const topVendors = Object.entries(vendorBreakdown).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxV = topVendors[0]?.[1] || 1;

  const hasValidMedia = (trip) =>
    Object.values(trip.entryMedia?.photos || {}).some(isValidKey) ||
    Object.values(trip.exitMedia?.photos  || {}).some(isValidKey) ||
    isValidKey(trip.entryMedia?.video) ||
    isValidKey(trip.exitMedia?.video);

  const selectStyle = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9,
    padding: "9px 32px 9px 12px", fontSize: 13, color: "#374151",
    outline: "none", cursor: "pointer", fontFamily: "inherit",
    appearance: "none", transition: "border-color .15s, box-shadow .15s",
    boxShadow: "0 1px 2px rgba(0,0,0,.04)"
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

        .trip-row { animation: fadeUp .3s ease both; }
        .trip-row:hover td { background: #faf5ff !important; }

        .media-btn:hover { background: #f5f3ff !important; border-color: #c4b5fd !important; color: #7c3aed !important; transform: scale(1.03); }

        select:focus { border-color: #a78bfa !important; box-shadow: 0 0 0 3px rgba(124,58,237,.1) !important; }
        input:focus  { border-color: #a78bfa !important; box-shadow: 0 0 0 3px rgba(124,58,237,.1) !important; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .sidebar-widgets { display: grid !important; grid-template-columns: 1fr 1fr !important; }
        }

        @media (max-width: 900px) {
          .stat-cards  { grid-template-columns: repeat(2, 1fr) !important; }
          .filters-row { grid-template-columns: repeat(2, 1fr) !important; }
          .page-body   { padding: 16px !important; }
        }

        @media (max-width: 640px) {
          .stat-cards  { grid-template-columns: repeat(2, 1fr) !important; }
          .filters-row { grid-template-columns: 1fr !important; }
          .sidebar-widgets { grid-template-columns: 1fr !important; }
          .page-body { padding: 10px !important; }
        }

        /* Hide overflow-x on table wrapper but allow scroll */
        .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table-wrapper table { min-width: 780px; width: 100%; border-collapse: collapse; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f6f7fb", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

        {/* ── SIDEBAR ── */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── RIGHT COLUMN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

          <Header title="VendorTrip Analytics" onMenuClick={() => setSidebarOpen(true)} />

          {/* ── PAGE BODY ── */}
          <div className="page-body" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "20px 20px" }}>
            <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

              {/* Page heading */}
              <div className="page-heading" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 8px rgba(124,58,237,.25)" }}>
                      <BarChart3 size={16} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Vendor Trip Analytics</h1>
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginLeft: 42, fontWeight: 500 }}>All vendor trip records with entry & exit media</p>
                </div>
                <button
                  onClick={fetchTrips}
                  style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 12px rgba(124,58,237,.3)", transition: "transform .15s, box-shadow .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(124,58,237,.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,58,237,.3)"; }}
                >
                  <RefreshCw size={13} style={loading ? { animation: "spin .7s linear infinite" } : {}} />
                  Refresh
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 9 }}>
                  <AlertTriangle size={15} color="#dc2626" />
                  <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{error}</span>
                </div>
              )}

              {/* Stat Cards */}
              <div className="stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18, width: "100%" }}>
                <StatCard Icon={Activity}     label="Total Trips"  value={total}  iconBg="#f5f3ff" iconColor="#7c3aed" />
                <StatCard Icon={TrendingUp}   label="Active"       value={inside} iconBg="#ecfdf5" iconColor="#059669" />
                <StatCard Icon={CheckCircle2} label="Completed"    value={exited} iconBg="#eff6ff" iconColor="#2563eb" />
                <StatCard Icon={XCircle}      label="Denied"       value={denied} iconBg="#fef2f2" iconColor="#dc2626" />
              </div>

              {/* Filters */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 18, boxShadow: "0 1px 3px rgba(0,0,0,.05)", border: "1px solid #f0f0f0", width: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <Filter size={12} color="#7c3aed" />
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em" }}>Filters</p>
                </div>
                <div className="filters-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, width: "100%", boxSizing: "border-box" }}>

                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 5, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}><Users size={10} color="#94a3b8" /> Vendor</p>
                    <div style={{ position: "relative" }}>
                      <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}>
                        <option value="all">All Vendors</option>
                        {vendors.map(v => <option key={v._id} value={v._id}>{v.name || v.companyName}</option>)}
                      </select>
                      <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 5, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}><Calendar size={10} color="#94a3b8" /> Period</p>
                    <div style={{ position: "relative" }}>
                      <select value={period} onChange={e => setPeriod(e.target.value)} style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}>
                        <option value="today">Today</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="last90days">Last 90 Days</option>
                        <option value="last120days">Last 120 Days</option>
                        <option value="alltime">All Time</option>
                      </select>
                      <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 5, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}><Clock size={10} color="#94a3b8" /> Status</p>
                    <div style={{ position: "relative" }}>
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}>
                        <option value="all">All Status</option>
                        <option value="INSIDE">Active</option>
                        <option value="EXITED">Completed</option>
                        <option value="DENIED">Denied</option>
                      </select>
                      <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", marginBottom: 5, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}><Search size={10} color="#94a3b8" /> Vehicle Number</p>
                    <div style={{ position: "relative" }}>
                      <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                      <input type="text" placeholder="e.g. MH04AB1234" value={search} onChange={e => setSearch(e.target.value)} style={{ ...selectStyle, width: "100%", boxSizing: "border-box", paddingLeft: 30 }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Main grid */}
              <div className="main-grid" style={{ display: "grid", gridTemplateColumns: topVendors.length ? "1fr 290px" : "1fr", gap: 18, alignItems: "start" }}>

                {/* TABLE */}
                <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
                  <div style={{ padding: "13px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafbff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Truck size={14} color="#7c3aed" />
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Trip Records</p>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", background: "#f1f5f9", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{trips.length} results</span>
                  </div>
                  <div className="table-wrapper">
                    {/* ── DESKTOP TABLE ── */}
                    <table className="desktop-table">
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          {["Trip ID","Vehicle","Vendor / Driver","Entry","Exit","Duration","Status","Media"].map(h => (
                            <th key={h} style={{ padding: "10px 16px", fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={8} style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
                            <Loader2 size={26} color="#7c3aed" style={{ animation: "spin .7s linear infinite", margin: "0 auto 10px", display: "block" }} />
                            <p style={{ fontSize: 13 }}>Loading trips…</p>
                          </td></tr>
                        ) : trips.length === 0 ? (
                          <tr><td colSpan={8} style={{ padding: 60, textAlign: "center" }}>
                            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                              <Truck size={26} color="#cbd5e1" />
                            </div>
                            <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>No trips found</p>
                            <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>Try changing the period to "All Time"</p>
                          </td></tr>
                        ) : trips.map((trip, i) => (
                          <tr key={trip._id} className="trip-row" style={{ animationDelay: `${Math.min(i,15)*.03}s`, cursor: "default" }}>
                            <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11.5, color: "#7c3aed", fontWeight: 700, borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap" }}>{trip.tripId || "—"}</td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}>
                              <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0f172a" }}>{trip.vehicleNumber}</div>
                              <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>{trip.vehicleType}</div>
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}>
                              <div style={{ fontSize: 12.5, color: "#1e293b", fontWeight: 600 }}>{trip.vendor}</div>
                              <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>{trip.driver && trip.driver !== "N/A" ? trip.driver : "—"}</div>
                            </td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", fontSize: 11, color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap" }}>{trip.entryTime || "—"}</td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", fontSize: 11, color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap" }}>{trip.exitTime && trip.exitTime !== "--" ? trip.exitTime : "—"}</td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", fontSize: 11.5, fontFamily: "monospace", color: "#374151", fontWeight: 600 }}>{trip.duration || "—"}</td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}><Badge status={trip.status} /></td>
                            <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}>
                              <button
                                className="media-btn"
                                onClick={() => hasValidMedia(trip) && setSelectedTrip(trip)}
                                title={hasValidMedia(trip) ? "View photos / video" : "No media"}
                                style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: hasValidMedia(trip) ? "pointer" : "default", color: hasValidMedia(trip) ? "#7c3aed" : "#d1d5db", display: "inline-flex", alignItems: "center", gap: 5, transition: "all .15s", opacity: hasValidMedia(trip) ? 1 : .4, whiteSpace: "nowrap" }}>
                                <ImageIcon size={11} />
                                Media
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ── MOBILE CARDS ── */}
                    <div className="mobile-cards" style={{ display: "none", padding: "8px 12px", flexDirection: "column", gap: 10 }}>
                      {loading ? (
                        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                          <Loader2 size={26} color="#7c3aed" style={{ animation: "spin .7s linear infinite", margin: "0 auto 10px", display: "block" }} />
                          <p style={{ fontSize: 13 }}>Loading trips…</p>
                        </div>
                      ) : trips.length === 0 ? (
                        <div style={{ padding: 48, textAlign: "center" }}>
                          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                            <Truck size={24} color="#cbd5e1" />
                          </div>
                          <p style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>No trips found</p>
                          <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>Try changing the period to "All Time"</p>
                        </div>
                      ) : trips.map((trip, i) => (
                        <div key={trip._id} className="trip-row" style={{
                          background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0",
                          boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden",
                          animationDelay: `${Math.min(i,15)*.03}s`
                        }}>
                          {/* Card Header */}
                          <div style={{ padding: "12px 14px 10px", background: "linear-gradient(135deg,#faf5ff,#eff6ff)", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#7c3aed", fontWeight: 700, letterSpacing: "0.03em" }}>{trip.tripId || "—"}</span>
                              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginTop: 2 }}>{trip.vehicleNumber}</div>
                              <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>{trip.vehicleType}</div>
                            </div>
                            <Badge status={trip.status} />
                          </div>

                          {/* Card Body */}
                          <div style={{ padding: "10px 14px" }}>
                            {/* Vendor + Driver row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 10px", background: "#f8fafc", borderRadius: 9 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Users size={12} color="#7c3aed" />
                              </div>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{trip.vendor || "—"}</div>
                                <div style={{ fontSize: 10.5, color: "#94a3b8" }}>{trip.driver && trip.driver !== "N/A" ? trip.driver : "No driver"}</div>
                              </div>
                            </div>

                            {/* Time + Duration grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "7px 8px" }}>
                                <div style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Entry</div>
                                <div style={{ fontSize: 10.5, color: "#374151", fontWeight: 600, lineHeight: 1.3 }}>{trip.entryTime || "—"}</div>
                              </div>
                              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "7px 8px" }}>
                                <div style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Exit</div>
                                <div style={{ fontSize: 10.5, color: "#374151", fontWeight: 600, lineHeight: 1.3 }}>{trip.exitTime && trip.exitTime !== "--" ? trip.exitTime : "—"}</div>
                              </div>
                              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "7px 8px" }}>
                                <div style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Duration</div>
                                <div style={{ fontSize: 10.5, color: "#374151", fontWeight: 700, fontFamily: "monospace" }}>{trip.duration || "—"}</div>
                              </div>
                            </div>

                            {/* Media button */}
                            <button
                              className="media-btn"
                              onClick={() => hasValidMedia(trip) && setSelectedTrip(trip)}
                              style={{
                                width: "100%", background: hasValidMedia(trip) ? "#faf5ff" : "#f8fafc",
                                border: `1px solid ${hasValidMedia(trip) ? "#e9d5ff" : "#e2e8f0"}`,
                                borderRadius: 9, padding: "9px 14px", fontSize: 12, fontWeight: 600,
                                cursor: hasValidMedia(trip) ? "pointer" : "default",
                                color: hasValidMedia(trip) ? "#7c3aed" : "#d1d5db",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                transition: "all .15s", opacity: hasValidMedia(trip) ? 1 : .5
                              }}>
                              <ImageIcon size={13} />
                              {hasValidMedia(trip) ? "View Media" : "No Media Available"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SIDEBAR WIDGETS */}
                {topVendors.length > 0 && (
                  <div className="sidebar-widgets" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* Top Vendors */}
                    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TrendingUp size={13} color="#7c3aed" />
                        </div>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>Top Vendors</p>
                      </div>
                      {topVendors.map(([name, count], idx) => (
                        <div key={name} style={{ marginBottom: 13 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                            <span style={{ fontSize: 11.5, color: "#374151", fontWeight: 600, maxWidth: 165, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={name}>{name}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", fontWeight: 700 }}>{count}</span>
                          </div>
                          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 4, transition: "width .6s cubic-bezier(.34,1.56,.64,1)", background: ["linear-gradient(90deg,#7c3aed,#a855f7)","linear-gradient(90deg,#a855f7,#c084fc)","linear-gradient(90deg,#c084fc,#ddd6fe)","linear-gradient(90deg,#ddd6fe,#ede9fe)","linear-gradient(90deg,#ede9fe,#faf5ff)"][idx] || "#f1f5f9", width: `${(count/maxV)*100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status Breakdown */}
                    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircle2 size={13} color="#7c3aed" />
                        </div>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>Status Breakdown</p>
                      </div>
                      {[
                        { label: "Active",    value: inside, color: "#059669", bg: "#ecfdf5", Icon: TrendingUp },
                        { label: "Completed", value: exited, color: "#2563eb", bg: "#eff6ff", Icon: CheckCircle2 },
                        { label: "Denied",    value: denied, color: "#dc2626", bg: "#fef2f2", Icon: XCircle },
                      ].map(s => (
                        <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", marginBottom: 6, borderRadius: 9, background: s.bg, border: "1px solid transparent", transition: "border .15s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "33"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <s.Icon size={12} color={s.color} />
                            <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{s.label}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
                            <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{total ? `${Math.round((s.value/total)*100)}%` : "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* PHOTO MODAL */}
        {selectedTrip && (
          <PhotoModal
            trip={selectedTrip}
            onClose={() => setSelectedTrip(null)}
          />
        )}
      </div>
    </>
  );
}