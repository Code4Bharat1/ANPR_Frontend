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
  { _id: "t1", tripId: "TRP-001", vehicleNumber: "MH04AB1234", vehicleType: "TRUCK", vendor: "Sharma Logistics", driver: "Ramesh Kumar", entryTime: "07 Mar 2025, 09:10 AM", exitTime: "07 Mar 2025, 11:45 AM", duration: "2h 35m", status: "EXITED", entryMedia: { photos: { frontView: "vehicles/v1/entry/photo-1.jpg" }, video: null }, exitMedia: { photos: { frontView: "vehicles/v1/exit/photo-1.jpg" }, video: "vehicles/v1/exit/video.mp4" } },
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: `1px solid ${s.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ Icon, label, value, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0] flex items-center gap-3 relative overflow-hidden transition-all hover:-translate-y-px hover:shadow-md"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 64, height: 64, borderRadius: "0 16px 0 64px", background: iconBg, opacity: 0.45 }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, flexShrink: 0, position: "relative" }} className="flex items-center justify-center">
        <Icon size={19} color={iconColor} />
      </div>
      <div className="relative">
        <p className="text-2xl font-extrabold text-slate-900 leading-none tracking-tight">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{label}</p>
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
    const photoKeys = Object.entries(media?.photos || {}).filter(([, v]) => isValidKey(v)).map(([label, key]) => ({ label, key, type: "image" }));
    const videoKey = isValidKey(media?.video) ? [{ label: "Video", key: media.video, type: "video" }] : [];
    return [...photoKeys, ...videoKey];
  }, [trip]);

  useEffect(() => {
    const items = getMediaKeys(tab);
    if (!items.length) return;
    const unfetched = items.filter(i => !urlMap[i.key]);
    if (!unfetched.length) return;
    setFetching(true);
    Promise.all(unfetched.map(async (item) => ({ key: item.key, url: await getSignedUrl(item.key) })))
      .then(results => {
        const newMap = { ...urlMap };
        results.forEach(r => { if (r.url) newMap[r.key] = r.url; });
        setUrlMap(newMap); setFetching(false);
      });
  }, [tab]);

  const items = getMediaKeys(tab);
  const LABELS = { frontView: "Front", backView: "Back", loadView: "Load", driverView: "Driver" };

  return (
    <>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes bdIn{from{opacity:0}to{opacity:1}}`}</style>
      <div onClick={onClose} className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,.6)", backdropFilter: "blur(6px)", animation: "bdIn .2s ease" }}>
        <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-[680px] max-h-[92vh] overflow-hidden flex flex-col" style={{ boxShadow: "0 32px 80px rgba(0,0,0,.25)", animation: "modalIn .25s ease" }}>

          <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg,#faf5ff,#f0f9ff)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 10px rgba(124,58,237,.3)" }}>
                <ImageIcon size={17} color="#fff" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900">Trip Media</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{trip.vehicleNumber} • {trip.tripId}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="flex gap-1.5 px-5 py-3 border-b border-slate-100 bg-slate-50">
            {[{ key: "entry", label: "Entry Media", Icon: Truck }, { key: "exit", label: "Exit Media", Icon: CheckCircle2 }].map(({ key, label, Icon: I }) => (
              <button key={key} onClick={() => setTab(key)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12.5px] font-semibold cursor-pointer border transition-all"
                style={{ background: tab === key ? "linear-gradient(135deg,#7c3aed,#9333ea)" : "#fff", color: tab === key ? "#fff" : "#64748b", border: tab === key ? "none" : "1px solid #e2e8f0", boxShadow: tab === key ? "0 4px 10px rgba(124,58,237,.25)" : "none" }}>
                <I size={12} /> {label}
              </button>
            ))}
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {fetching ? (
              <div className="py-14 text-center text-slate-400">
                <Loader2 size={28} color="#7c3aed" style={{ animation: "spin .7s linear infinite", margin: "0 auto 12px", display: "block" }} />
                <p className="text-[13px]">Loading media…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><ImageIcon size={26} color="#cbd5e1" /></div>
                <p className="text-[13px] font-semibold text-slate-500">No media available</p>
              </div>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))" }}>
                { items && items.map(({ label, key, type }) => {
                  const url = urlMap[key];
                  return (
                    <div key={key} onClick={() => url && setLightbox({ src: url, type })}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative transition-all hover:scale-[1.02] hover:shadow-lg"
                      style={{ aspectRatio: type === "video" ? "16/9" : "4/3", cursor: url ? "pointer" : "default" }}>
                      <span className="absolute top-2 left-2 z-10 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1" style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}>
                        {type === "video" && <Play size={8} fill="#fff" />}{LABELS[label] || label}
                      </span>
                      {url ? (
                        type === "video" ? <video src={url} className="w-full h-full object-cover" muted /> : <img src={url} alt={label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                          <Loader2 size={20} style={{ animation: "spin .7s linear infinite" }} />
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

      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: "rgba(0,0,0,.96)" }}>
          {lightbox.type === "video"
            ? <video src={lightbox.src} controls autoPlay className="max-w-[90vw] max-h-[90vh] rounded-xl" onClick={e => e.stopPropagation()} />
            : <img src={lightbox.src} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" />
          }
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer border" style={{ background: "rgba(255,255,255,.1)", borderColor: "rgba(255,255,255,.15)" }}>
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

  const token = () => localStorage.getItem("token") || localStorage.getItem("accessToken") || sessionStorage.getItem("token") || "";
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || localStorage.getItem("userData") || sessionStorage.getItem("user") || "{}"); }
    catch { return {}; }
  };

  useEffect(() => {
    if (USE_MOCK) { setVendors(MOCK_VENDORS); return; }
    const user = getUser();
    const params = new URLSearchParams();
    if (user?.clientId) params.set("clientId", user.clientId);
    fetch(`${API_URL}/api/project/vendors?${params}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => setVendors(d)).catch(console.log);
  }, []);

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
      const res = await fetch(`${API_URL}/api/trips/history?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) { setError(`API ${res.status}`); setTrips([]); return; }
      const data = await res.json();
      setTrips(data.data || data.trips || []);
    } catch (e) { setError(`Network error: ${e.message}`); setTrips([]); }
    finally { setLoading(false); }
  }, [selectedVendor, period, statusFilter, search]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

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
    isValidKey(trip.entryMedia?.video) || isValidKey(trip.exitMedia?.video);

  const selStyle = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9,
    padding: "9px 32px 9px 12px", fontSize: 13, color: "#374151",
    outline: "none", cursor: "pointer", fontFamily: "inherit",
    appearance: "none", boxShadow: "0 1px 2px rgba(0,0,0,.04)",
    width: "100%", boxSizing: "border-box"
  };

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

        .trip-row          { animation: fadeUp .25s ease both; }
        .trip-row:hover td { background: #faf5ff !important; }
        .media-btn:hover   { background: #f5f3ff !important; border-color: #c4b5fd !important; color: #7c3aed !important; }
        select:focus,input:focus { border-color: #a78bfa !important; box-shadow: 0 0 0 3px rgba(124,58,237,.1) !important; outline: none; }

        /* Table / card toggle */
        .desktop-table { display: table !important; }
        .mobile-cards  { display: none   !important; }
        .trip-table    { min-width: 780px; width: 100%; border-collapse: collapse; }
        .table-scroll  { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        @media (max-width: 768px) {
          .desktop-table     { display: none  !important; }
          .mobile-cards      { display: flex  !important; flex-direction: column; gap: 10px; padding: 10px; }
          .stat-grid         { grid-template-columns: repeat(2,1fr) !important; }
          .filter-grid       { grid-template-columns: repeat(2,1fr) !important; }
          .content-grid      { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 480px) {
          .filter-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ROOT — fixed height, NO outer scroll */}
      <div className="flex h-screen overflow-hidden bg-[#f6f7fb]" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right panel — fills space, inner body scrolls */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          <Header title="VendorTrip Analytics" onMenuClick={() => setSidebarOpen(true)} />

          {/* ✅ Only this div scrolls */}
          <div className="flex-1 md:-mr-1 overflow-y-auto mx-auto flex items-start justify-end overflow-x-hidden px-4 py-5 md:px-5 w-full md:w-[80%]">
            <div className="mx-auto w-full">

              {/* Heading row */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div />
                <button onClick={fetchTrips}
                  className="flex items-center gap-2 text-white text-[13px] font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all hover:-translate-y-px border-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#9333ea)", boxShadow: "0 4px 12px rgba(124,58,237,.3)" }}>
                  <RefreshCw size={13} style={loading ? { animation: "spin .7s linear infinite" } : {}} />
                  Refresh
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium rounded-xl px-4 py-3 mb-4">
                  <AlertTriangle size={15} /> {error}
                </div>
              )}

              {/* Stat Cards */}
              <div className="stat-grid grid grid-cols-4 gap-3 mb-4">
                <StatCard Icon={Activity}     label="Total Trips"  value={total}  iconBg="#f5f3ff" iconColor="#7c3aed" />
                <StatCard Icon={TrendingUp}   label="Active"       value={inside} iconBg="#ecfdf5" iconColor="#059669" />
                <StatCard Icon={CheckCircle2} label="Completed"    value={exited} iconBg="#eff6ff" iconColor="#2563eb" />
                <StatCard Icon={XCircle}      label="Denied"       value={denied} iconBg="#fef2f2" iconColor="#dc2626" />
              </div>

              {/* Filters */}
              <div className="bg-white rounded-2xl p-4 mb-4 border border-[#f0f0f0]" style={{ boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={12} color="#7c3aed" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filters</span>
                </div>
                <div className="filter-grid grid grid-cols-4 gap-3">

                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1"><Users size={10} /> Vendor</p>
                    <div className="relative">
                      <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} style={selStyle}>
                        <option value="all">All Vendors</option>
                        {vendors && vendors.map(v => <option key={v._id} value={v._id}>{v.name || v.companyName}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1"><Calendar size={10} /> Period</p>
                    <div className="relative">
                      <select value={period} onChange={e => setPeriod(e.target.value)} style={selStyle}>
                        <option value="today">Today</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                        <option value="last90days">Last 90 Days</option>
                        <option value="last120days">Last 120 Days</option>
                        <option value="alltime">All Time</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1"><Clock size={10} /> Status</p>
                    <div className="relative">
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selStyle}>
                        <option value="all">All Status</option>
                        <option value="INSIDE">Active</option>
                        <option value="EXITED">Completed</option>
                        <option value="DENIED">Denied</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1"><Search size={10} /> Vehicle Number</p>
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="e.g. MH04AB1234" value={search} onChange={e => setSearch(e.target.value)} style={{ ...selStyle, paddingLeft: 30 }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Content grid */}
              <div className="content-grid grid gap-4" style={{ gridTemplateColumns: topVendors.length ? "1fr 280px" : "1fr", alignItems: "start" }}>

                {/* TABLE CARD */}
                <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-[#fafbff]">
                    <div className="flex items-center gap-2">
                      <Truck size={14} color="#7c3aed" />
                      <span className="text-[13px] font-bold text-slate-900">Trip Records</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold font-mono bg-slate-100 px-3 py-0.5 rounded-full">{trips.length} results</span>
                  </div>

                  <div className="table-scroll">

                    {/* ── DESKTOP TABLE ── */}
                    <table className="desktop-table trip-table">
                      <thead>
                        <tr className="bg-slate-50">
                          {["Trip ID","Vehicle","Vendor / Driver","Entry","Exit","Duration","Status","Media"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap border-b border-slate-100 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                            <Loader2 size={26} color="#7c3aed" style={{ animation: "spin .7s linear infinite", margin: "0 auto 10px", display: "block" }} />
                            <p className="text-[13px]">Loading trips…</p>
                          </td></tr>
                        ) : trips.length === 0 ? (
                          <tr><td colSpan={8} className="py-16 text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><Truck size={24} color="#cbd5e1" /></div>
                            <p className="text-slate-500 font-semibold">No trips found</p>
                            <p className="text-slate-400 text-[12px] mt-1">Try changing the period to "All Time"</p>
                          </td></tr>
                        ) : trips && trips.map((trip, i) => (
                          <tr key={trip._id} className="trip-row" style={{ animationDelay: `${Math.min(i,15)*.03}s` }}>
                            <td className="px-4 py-3 font-mono text-[11.5px] text-violet-600 font-bold whitespace-nowrap border-b border-slate-50">{trip.tripId || "—"}</td>
                            <td className="px-4 py-3 border-b border-slate-50">
                              <div className="font-bold text-[12.5px] text-slate-900">{trip.vehicleNumber}</div>
                              <div className="text-[10.5px] text-slate-400 mt-0.5">{trip.vehicleType}</div>
                            </td>
                            <td className="px-4 py-3 border-b border-slate-50">
                              <div className="text-[12.5px] text-slate-700 font-semibold">{trip.vendor}</div>
                              <div className="text-[10.5px] text-slate-400 mt-0.5">{trip.driver && trip.driver !== "N/A" ? trip.driver : "—"}</div>
                            </td>
                            <td className="px-4 py-3 border-b border-slate-50 text-[11px] text-slate-500 font-mono whitespace-nowrap">{trip.entryTime || "—"}</td>
                            <td className="px-4 py-3 border-b border-slate-50 text-[11px] text-slate-500 font-mono whitespace-nowrap">{trip.exitTime && trip.exitTime !== "--" ? trip.exitTime : "—"}</td>
                            <td className="px-4 py-3 border-b border-slate-50 text-[11.5px] font-mono text-slate-700 font-semibold">{trip.duration || "—"}</td>
                            <td className="px-4 py-3 border-b border-slate-50"><Badge status={trip.status} /></td>
                            <td className="px-4 py-3 border-b border-slate-50">
                              <button className="media-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
                                onClick={() => hasValidMedia(trip) && setSelectedTrip(trip)}
                                style={{ background: "#faf5ff", borderColor: "#e9d5ff", color: hasValidMedia(trip) ? "#7c3aed" : "#d1d5db", cursor: hasValidMedia(trip) ? "pointer" : "default", opacity: hasValidMedia(trip) ? 1 : .4 }}>
                                <ImageIcon size={11} /> Media
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ── MOBILE CARDS ── */}
                    <div className="mobile-cards">
                      {loading ? (
                        <div className="py-12 text-center text-slate-400">
                          <Loader2 size={26} color="#7c3aed" style={{ animation: "spin .7s linear infinite", margin: "0 auto 10px", display: "block" }} />
                          <p className="text-[13px]">Loading trips…</p>
                        </div>
                      ) : trips.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><Truck size={24} color="#cbd5e1" /></div>
                          <p className="text-slate-500 font-semibold">No trips found</p>
                        </div>
                      ) : trips.map((trip, i) => (
                        <div key={trip._id} className="trip-row bg-white rounded-2xl border border-slate-100 overflow-hidden"
                          style={{ boxShadow: "0 2px 8px rgba(0,0,0,.07)", animationDelay: `${Math.min(i,15)*.03}s` }}>

                          {/* Card Header */}
                          <div className="flex justify-between items-start px-4 py-3 border-b border-slate-100" style={{ background: "linear-gradient(135deg,#faf5ff,#eff6ff)" }}>
                            <div>
                              <span className="font-mono text-[11px] text-violet-600 font-bold">{trip.tripId || "—"}</span>
                              <div className="font-extrabold text-[16px] text-slate-900 mt-0.5 tracking-tight">{trip.vehicleNumber}</div>
                              <div className="text-[10.5px] text-slate-400 uppercase tracking-wide mt-0.5">{trip.vehicleType}</div>
                            </div>
                            <Badge status={trip.status} />
                          </div>

                          {/* Card Body */}
                          <div className="p-3 space-y-2.5">
                            {/* Vendor row */}
                            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl">
                              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                                <Users size={13} color="#7c3aed" />
                              </div>
                              <div>
                                <div className="text-[12.5px] font-bold text-slate-800">{trip.vendor || "—"}</div>
                                <div className="text-[10.5px] text-slate-400">{trip.driver && trip.driver !== "N/A" ? trip.driver : "No driver"}</div>
                              </div>
                            </div>

                            {/* Time grid */}
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { lbl: "Entry",    val: trip.entryTime || "—" },
                                { lbl: "Exit",     val: trip.exitTime && trip.exitTime !== "--" ? trip.exitTime : "—" },
                                { lbl: "Duration", val: trip.duration || "—" },
                              ].map(({ lbl, val }) => (
                                <div key={lbl} className="bg-slate-50 rounded-xl p-2">
                                  <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wide mb-1">{lbl}</div>
                                  <div className="text-[10.5px] text-slate-700 font-semibold leading-snug">{val}</div>
                                </div>
                              ))}
                            </div>

                            {/* Media button */}
                            <button
                              className="media-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold border transition-all"
                              onClick={() => hasValidMedia(trip) && setSelectedTrip(trip)}
                              style={{
                                background: hasValidMedia(trip) ? "#faf5ff" : "#f8fafc",
                                borderColor: hasValidMedia(trip) ? "#e9d5ff" : "#e2e8f0",
                                color: hasValidMedia(trip) ? "#7c3aed" : "#cbd5e1",
                                cursor: hasValidMedia(trip) ? "pointer" : "default",
                                opacity: hasValidMedia(trip) ? 1 : .5
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
                  <div className="flex flex-col gap-3">

                    <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0]" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center"><TrendingUp size={13} color="#7c3aed" /></div>
                        <span className="text-[12.5px] font-bold text-slate-900">Top Vendors</span>
                      </div>
                      {topVendors && topVendors.map(([name, count], idx) => (
                        <div key={name} className="mb-3">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11.5px] text-slate-700 font-semibold truncate max-w-[160px]" title={name}>{name}</span>
                            <span className="text-[11px] text-slate-400 font-mono font-bold">{count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div style={{ height: "100%", borderRadius: 4, transition: "width .6s cubic-bezier(.34,1.56,.64,1)", background: ["linear-gradient(90deg,#7c3aed,#a855f7)","linear-gradient(90deg,#a855f7,#c084fc)","linear-gradient(90deg,#c084fc,#ddd6fe)","linear-gradient(90deg,#ddd6fe,#ede9fe)","linear-gradient(90deg,#ede9fe,#faf5ff)"][idx] || "#f1f5f9", width: `${(count/maxV)*100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-[#f0f0f0]" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center"><CheckCircle2 size={13} color="#7c3aed" /></div>
                        <span className="text-[12.5px] font-bold text-slate-900">Status Breakdown</span>
                      </div>
                      {[
                        { label: "Active",    value: inside, color: "#059669", bg: "#ecfdf5", Icon: TrendingUp },
                        { label: "Completed", value: exited, color: "#2563eb", bg: "#eff6ff", Icon: CheckCircle2 },
                        { label: "Denied",    value: denied, color: "#dc2626", bg: "#fef2f2", Icon: XCircle },
                      ].map(s => (
                        <div key={s.label} className="flex items-center justify-between px-2.5 py-2 mb-1.5 rounded-xl" style={{ background: s.bg }}>
                          <div className="flex items-center gap-2">
                            <s.Icon size={12} color={s.color} />
                            <span className="text-[12px] text-slate-700 font-semibold">{s.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[15px] font-extrabold" style={{ color: s.color }}>{s.value}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{total ? `${Math.round((s.value/total)*100)}%` : "—"}</span>
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

        {selectedTrip && <PhotoModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
      </div>
    </>
  );
}