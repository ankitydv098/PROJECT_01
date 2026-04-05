// Finance Dashboard UI — Single-file React App (IMPROVED)
// Stack: React + hooks, Recharts, inline styles
// IMPROVED: Toast notifications, Confirm dialog, Skeleton loading,
//           Responsive layouts (CSS media queries), Smart MoM insights,
//           Centralised style tokens, Hover effects, Keyboard shortcuts

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const CATEGORIES   = ["Housing","Food","Transport","Health","Entertainment","Shopping","Salary","Freelance","Investment"];
const CAT_ICONS    = { Housing:"🏠", Food:"🍜", Transport:"🚌", Health:"💊", Entertainment:"🎬", Shopping:"🛍️", Salary:"💼", Freelance:"💻", Investment:"📈" };
const EXPENSE_CATS = ["Housing","Food","Transport","Health","Entertainment","Shopping"];
const INCOME_CATS  = ["Salary","Freelance","Investment"];

const SEED_TRANSACTIONS = [
  { id:1,  date:"2025-10-01", description:"Monthly Salary",         category:"Salary",        type:"income",  amount:85000 },
  { id:2,  date:"2025-10-02", description:"Rent Payment",           category:"Housing",       type:"expense", amount:22000 },
  { id:3,  date:"2025-10-04", description:"Grocery Store",          category:"Food",          type:"expense", amount:3200  },
  { id:4,  date:"2025-10-05", description:"Metro Card",             category:"Transport",     type:"expense", amount:800   },
  { id:5,  date:"2025-10-07", description:"Freelance Project",      category:"Freelance",     type:"income",  amount:18000 },
  { id:6,  date:"2025-10-09", description:"Movie Tickets",          category:"Entertainment", type:"expense", amount:1200  },
  { id:7,  date:"2025-10-11", description:"Pharmacy",               category:"Health",        type:"expense", amount:950   },
  { id:8,  date:"2025-10-13", description:"Online Shopping",        category:"Shopping",      type:"expense", amount:4500  },
  { id:9,  date:"2025-10-15", description:"Dividend Income",        category:"Investment",    type:"income",  amount:5200  },
  { id:10, date:"2025-10-17", description:"Restaurant Dinner",      category:"Food",          type:"expense", amount:2100  },
  { id:11, date:"2025-10-19", description:"Uber Rides",             category:"Transport",     type:"expense", amount:1400  },
  { id:12, date:"2025-10-22", description:"Gym Membership",         category:"Health",        type:"expense", amount:2000  },
  { id:13, date:"2025-10-25", description:"Freelance Bonus",        category:"Freelance",     type:"income",  amount:9000  },
  { id:14, date:"2025-10-28", description:"Clothes Shopping",       category:"Shopping",      type:"expense", amount:6800  },
  { id:15, date:"2025-10-30", description:"Streaming Services",     category:"Entertainment", type:"expense", amount:1500  },
  { id:16, date:"2025-11-01", description:"Monthly Salary",         category:"Salary",        type:"income",  amount:85000 },
  { id:17, date:"2025-11-02", description:"Rent Payment",           category:"Housing",       type:"expense", amount:22000 },
  { id:18, date:"2025-11-05", description:"Grocery Store",          category:"Food",          type:"expense", amount:2800  },
  { id:19, date:"2025-11-07", description:"Cab to Airport",         category:"Transport",     type:"expense", amount:2200  },
  { id:20, date:"2025-11-10", description:"Freelance Project",      category:"Freelance",     type:"income",  amount:22000 },
  { id:21, date:"2025-11-12", description:"Concert Tickets",        category:"Entertainment", type:"expense", amount:3500  },
  { id:22, date:"2025-11-14", description:"Doctor Visit",           category:"Health",        type:"expense", amount:1800  },
  { id:23, date:"2025-11-17", description:"Online Shopping",        category:"Shopping",      type:"expense", amount:3200  },
  { id:24, date:"2025-11-20", description:"Stock Dividend",         category:"Investment",    type:"income",  amount:4100  },
  { id:25, date:"2025-11-22", description:"Food Delivery",          category:"Food",          type:"expense", amount:1600  },
  { id:26, date:"2025-11-25", description:"Bus Pass",               category:"Transport",     type:"expense", amount:600   },
  { id:27, date:"2025-11-27", description:"Vitamins & Supplements", category:"Health",        type:"expense", amount:1100  },
  { id:28, date:"2025-11-29", description:"Gaming Subscription",    category:"Entertainment", type:"expense", amount:999   },
  { id:29, date:"2025-12-01", description:"Monthly Salary",         category:"Salary",        type:"income",  amount:90000 },
  { id:30, date:"2025-12-02", description:"Rent Payment",           category:"Housing",       type:"expense", amount:22000 },
  { id:31, date:"2025-12-04", description:"Grocery Store",          category:"Food",          type:"expense", amount:4100  },
  { id:32, date:"2025-12-06", description:"Freelance Design",       category:"Freelance",     type:"income",  amount:30000 },
  { id:33, date:"2025-12-08", description:"Metro Pass",             category:"Transport",     type:"expense", amount:800   },
  { id:34, date:"2025-12-10", description:"Holiday Shopping",       category:"Shopping",      type:"expense", amount:12000 },
  { id:35, date:"2025-12-12", description:"Year-end Bonus",         category:"Salary",        type:"income",  amount:20000 },
  { id:36, date:"2025-12-15", description:"Health Checkup",         category:"Health",        type:"expense", amount:3500  },
  { id:37, date:"2025-12-18", description:"New Year Party",         category:"Entertainment", type:"expense", amount:5000  },
  { id:38, date:"2025-12-20", description:"Mutual Fund SIP",        category:"Investment",    type:"income",  amount:8000  },
  { id:39, date:"2025-12-23", description:"Gift Shopping",          category:"Shopping",      type:"expense", amount:7500  },
  { id:40, date:"2025-12-28", description:"Restaurant Outing",      category:"Food",          type:"expense", amount:2900  },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ACCENT     = "#F59E0B";
const ACCENT2    = "#10B981";
const DANGER     = "#EF4444";
const INDIGO     = "#6366F1";
const PIE_COLORS = ["#F59E0B","#10B981","#6366F1","#EC4899","#14B8A6","#F97316","#8B5CF6","#EF4444","#06B6D4"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt      = (n) => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(n);
const fmtShort = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;
const getMonth = (d) => new Date(d).toLocaleString("default", { month:"short", year:"2-digit" });

// IMPROVED: build per-category per-month spend map for smart insights
const buildCatMonthMap = (txns) => {
  const map = {};
  txns.filter(t => t.type === "expense").forEach(t => {
    const key = `${t.category}:${getMonth(t.date)}`;
    map[key] = (map[key] || 0) + t.amount;
  });
  return map;
};

// ─── IMPROVED: LIGHTWEIGHT TOAST SYSTEM ──────────────────────────────────────

let _tid = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = ++_tid;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, push, dismiss };
}

// IMPROVED: Toast container — fixed bottom-right, slide-in animation, no library needed
function ToastContainer({ toasts, dismiss, surface, border, textColor }) {
  const palette = { success: ACCENT2, error: DANGER, info: INDIGO };
  const icons   = { success: "✓", error: "✕", info: "ℹ" };
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end", pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-in" style={{ backgroundColor:surface, border:`1px solid ${border}`, borderLeft:`4px solid ${palette[t.type]||ACCENT2}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, minWidth:260, maxWidth:340, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", color:textColor, fontSize:14, fontWeight:500, pointerEvents:"auto" }}>
          <span style={{ fontSize:14, color:palette[t.type]||ACCENT2, fontWeight:700 }}>{icons[t.type]||"✓"}</span>
          <span style={{ flex:1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:18, lineHeight:1, padding:0 }}>×</button>
        </div>
      ))}
    </div>
  );
}

// IMPROVED: Confirm dialog — replaces instant delete with a two-step confirmation
function ConfirmDialog({ message, onConfirm, onCancel, surface, surface2, textColor, border: borderColor }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Enter") onConfirm(); if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onConfirm, onCancel]);
  return (
    <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="fade-up" style={{ backgroundColor:surface, border:`1px solid ${borderColor}`, borderRadius:20, padding:28, width:"100%", maxWidth:400, boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ width:48, height:48, borderRadius:14, backgroundColor:`${DANGER}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}>🗑️</div>
        <div style={{ fontSize:18, fontWeight:700, color:textColor, marginBottom:8, fontFamily:"'Playfair Display',serif" }}>Delete Transaction</div>
        <div style={{ fontSize:14, color:"#9CA3AF", lineHeight:1.65, marginBottom:22 }}>{message}</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel}  style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1px solid ${borderColor}`, cursor:"pointer", fontSize:14, fontWeight:600, backgroundColor:surface2, color:textColor }} className="btn-hover">Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"10px 0", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, backgroundColor:DANGER, color:"#fff" }} className="btn-hover">Delete</button>
        </div>
      </div>
    </div>
  );
}

// IMPROVED: Skeleton placeholder card with animated shimmer
function SkeletonCard({ surface2, shimmerColor, height = 120, style: extraStyle = {} }) {
  return (
    <div style={{ backgroundColor:surface2, borderRadius:16, height, overflow:"hidden", position:"relative", ...extraStyle }}>
      <div className="skeleton-shimmer" style={{ position:"absolute", inset:0, background:`linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)` }} />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode,      setDarkMode]      = useState(true);
  const [role,          setRole]          = useState("admin");
  const [activeTab,     setActiveTab]     = useState("overview");
  const [isLoading,     setIsLoading]     = useState(true); // IMPROVED: skeleton loading
  const [transactions,  setTransactions]  = useState(() => {
    try   { const s = localStorage.getItem("fin_txns"); return s ? JSON.parse(s) : SEED_TRANSACTIONS; }
    catch { return SEED_TRANSACTIONS; }
  });
  const [filters,       setFilters]       = useState({ search:"", type:"all", category:"all", month:"all" });
  const [sortConfig,    setSortConfig]    = useState({ key:"date", dir:"desc" });
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [editTxn,       setEditTxn]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // IMPROVED: confirm before delete

  const { toasts, push: toast, dismiss: dismissToast } = useToast();

  // IMPROVED: Simulated load for skeleton demo (realistic pattern)
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 800); return () => clearTimeout(t); }, []);
  useEffect(() => { localStorage.setItem("fin_txns", JSON.stringify(transactions)); }, [transactions]);

  // ── Theme tokens ──
  const bg       = darkMode ? "#0F1117" : "#F8F7F4";
  const surface  = darkMode ? "#171B26" : "#FFFFFF";
  const surface2 = darkMode ? "#1E2333" : "#F1F0ED";
  const text     = darkMode ? "#E8E6E0" : "#1A1915";
  const muted    = darkMode ? "#6B7280" : "#9CA3AF";
  const border   = darkMode ? "#2A2F3E" : "#E5E3DF";
  const shimmer  = darkMode ? "#252B3B" : "#E5E2DC";

  // ── Derived stats ──
  const totalIncome  = useMemo(() => transactions.filter(t => t.type === "income").reduce((s,t)  => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s,t) => s + t.amount, 0), [transactions]);
  const balance      = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const m = getMonth(t.date);
      if (!map[m]) map[m] = { month:m, income:0, expense:0 };
      if (t.type === "income") map[m].income += t.amount; else map[m].expense += t.amount;
    });
    return Object.values(map).map(m => ({ ...m, balance: m.income - m.expense }));
  }, [transactions]);

  const catData = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name,value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [transactions]);

  // IMPROVED: Smart per-category MoM insights — surfaces changes ≥15% as banners
  const smartInsights = useMemo(() => {
    if (monthlyData.length < 2) return [];
    const catMonthMap = buildCatMonthMap(transactions);
    const lastM = monthlyData[monthlyData.length - 1].month;
    const prevM = monthlyData[monthlyData.length - 2].month;
    return EXPENSE_CATS
      .map(cat => {
        const cur  = catMonthMap[`${cat}:${lastM}`] || 0;
        const prev = catMonthMap[`${cat}:${prevM}`] || 0;
        if (!prev || !cur) return null;
        const pct = Math.round(((cur - prev) / prev) * 100);
        return Math.abs(pct) >= 15 ? { cat, cur, prev, pct, lastM, prevM } : null;
      })
      .filter(Boolean)
      .sort((a,b) => Math.abs(b.pct) - Math.abs(a.pct))
      .slice(0, 3);
  }, [transactions, monthlyData]);

  const topCat = catData[0];
  const monthlyComparison = useMemo(() => {
    if (monthlyData.length < 2) return null;
    const last = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];
    return { last, prev, diff: last.expense - prev.expense, pct: prev.expense > 0 ? (((last.expense - prev.expense) / prev.expense) * 100).toFixed(1) : 0 };
  }, [monthlyData]);

  const filtered = useMemo(() => {
    let list = [...transactions];
    const q = filters.search.toLowerCase();
    if (q)                          list = list.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    if (filters.type !== "all")     list = list.filter(t => t.type === filters.type);
    if (filters.category !== "all") list = list.filter(t => t.category === filters.category);
    if (filters.month !== "all")    list = list.filter(t => getMonth(t.date) === filters.month);
    list.sort((a,b) => {
      let av = a[sortConfig.key], bv = b[sortConfig.key];
      if (sortConfig.key === "amount") { av = +av; bv = +bv; }
      return av < bv ? (sortConfig.dir === "asc" ? -1 :  1)
           : av > bv ? (sortConfig.dir === "asc" ?  1 : -1) : 0;
    });
    return list;
  }, [transactions, filters, sortConfig]);

  const months = useMemo(() => [...new Set(transactions.map(t => getMonth(t.date)))], [transactions]);

  // ── IMPROVED: CRUD with toast feedback ──
  const addTxn = useCallback((txn) => {
    setTransactions(p => [{ ...txn, id: Date.now() }, ...p]);
    setShowAddModal(false);
    toast(`"${txn.description}" added`, "success");
  }, [toast]);

  const updateTxn = useCallback((txn) => {
    setTransactions(p => p.map(t => t.id === txn.id ? txn : t));
    setEditTxn(null);
    toast(`"${txn.description}" updated`, "success");
  }, [toast]);

  // IMPROVED: Two-step delete — show confirm dialog first
  const requestDelete    = useCallback((txn) => setConfirmDelete(txn), []);
  const confirmDeleteTxn = useCallback(() => {
    if (!confirmDelete) return;
    setTransactions(p => p.filter(t => t.id !== confirmDelete.id));
    toast(`"${confirmDelete.description}" deleted`, "error");
    setConfirmDelete(null);
  }, [confirmDelete, toast]);

  const exportCSV = useCallback(() => {
    const rows = filtered.map(t => `${t.date},"${t.description}",${t.category},${t.type},${t.amount}`).join("\n");
    const url  = URL.createObjectURL(new Blob(["Date,Description,Category,Type,Amount\n" + rows], { type:"text/csv" }));
    Object.assign(document.createElement("a"), { href:url, download:"transactions.csv" }).click();
    URL.revokeObjectURL(url);
    toast(`${filtered.length} transactions exported`, "info");
  }, [filtered, toast]);

  // ── IMPROVED: Centralised reusable style tokens ──
  // Replaces scattered one-off style objects across JSX
  const S = useMemo(() => ({
    card:       { backgroundColor:surface, border:`1px solid ${border}`, borderRadius:16, padding:24, transition:"box-shadow 0.2s, transform 0.2s" },
    statLabel:  { fontSize:11, fontWeight:600, color:muted, textTransform:"uppercase", letterSpacing:"0.08em" },
    statValue:  { fontSize:28, fontWeight:700, marginTop:4, letterSpacing:"-0.5px" },
    badge:      (type) => ({ padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:600, display:"inline-block", backgroundColor:type==="income"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.12)", color:type==="income"?ACCENT2:DANGER }),
    tag:        { display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:500, backgroundColor:surface2, color:muted, whiteSpace:"nowrap" },
    table:      { width:"100%", borderCollapse:"collapse" },
    th:         { padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", borderBottom:`1px solid ${border}`, cursor:"pointer", userSelect:"none", whiteSpace:"nowrap" },
    td:         { padding:"13px 16px", fontSize:14, borderBottom:`1px solid ${border}` },
    input:      { backgroundColor:surface2, border:`1px solid ${border}`, borderRadius:10, padding:"10px 14px", color:text, fontSize:14, outline:"none", width:"100%", transition:"border-color 0.15s, box-shadow 0.15s" },
    select:     { backgroundColor:surface2, border:`1px solid ${border}`, borderRadius:10, padding:"10px 14px", color:text, fontSize:14, outline:"none", cursor:"pointer" },
    btn:        (v) => ({ padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer", fontSize:14, fontWeight:600, whiteSpace:"nowrap", transition:"opacity 0.18s, transform 0.15s", backgroundColor:v==="primary"?ACCENT:v==="danger"?DANGER:surface2, color:v==="primary"?"#000":v==="danger"?"#fff":text }),
    modal:      { position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 },
    modalBox:   { backgroundColor:surface, border:`1px solid ${border}`, borderRadius:20, padding:28, width:"100%", maxWidth:480 },
    fieldLabel: { fontSize:11, fontWeight:600, color:muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 },
    h1:         { fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.5px" },
    sub:        { color:muted, marginTop:4, fontSize:14 },
    pill:       (a) => ({ padding:"6px 14px", borderRadius:999, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, backgroundColor:a?ACCENT:"transparent", color:a?"#000":muted, transition:"all 0.2s" }),
    roleBadge:  (r) => ({ padding:"4px 10px", borderRadius:999, fontSize:12, fontWeight:600, whiteSpace:"nowrap", backgroundColor:r==="admin"?"#FEF3C7":"#DBEAFE", color:r==="admin"?"#92400E":"#1E40AF" }),
    tip:        { backgroundColor:surface, border:`1px solid ${border}`, borderRadius:10, color:text },
  }), [surface, surface2, text, muted, border]);

  return (
    <div style={{ minHeight:"100vh", backgroundColor:bg, color:text, fontFamily:"'DM Sans','Segoe UI',sans-serif", transition:"background 0.3s, color 0.3s" }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${border}; border-radius:3px; }
        input::placeholder { color:${muted}; }
        select option { background:${surface}; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }

        .fade-up          { animation: fadeUp  0.36s ease forwards; }
        .toast-in         { animation: toastIn 0.28s ease forwards; }
        .skeleton-shimmer { animation: shimmer 1.5s ease-in-out infinite; }

        /* IMPROVED: performance-friendly hover via CSS classes */
        .btn-hover:hover  { opacity:0.82 !important; transform:scale(0.97) !important; }
        .card-hover:hover { box-shadow:0 8px 28px rgba(0,0,0,0.13) !important; transform:translateY(-2px) !important; }
        .row-hover:hover  { background:${surface2} !important; }
        .th-hover:hover   { color:${text} !important; }

        /* IMPROVED: visible focus rings for accessibility */
        input:focus, select:focus { border-color:${ACCENT} !important; box-shadow:0 0 0 3px ${ACCENT}28 !important; }

        /* IMPROVED: nav tab strip scrollable on mobile, no wrapping */
        .nav-tabs { display:flex; gap:4; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; }
        .nav-tabs::-webkit-scrollbar { display:none; }

        /* IMPROVED: responsive layout via CSS media queries — no JS resize listeners */
        @media (max-width:860px) { .chart-2col { grid-template-columns:1fr !important; } }
        @media (max-width:600px) {
          .main-pad       { padding:18px 14px !important; }
          .page-h1        { font-size:22px !important; }
          .filter-bar     { flex-direction:column !important; }
          .filter-bar > * { width:100% !important; flex:none !important; }
          .modal-2col     { grid-template-columns:1fr !important; }
          .stat-val       { font-size:22px !important; }
          .hide-xs        { display:none !important; }
          .txn-hdr        { flex-direction:column !important; align-items:flex-start !important; }
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{ backgroundColor:surface, borderBottom:`1px solid ${border}`, padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, height:64, gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, minWidth:0 }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:ACCENT, letterSpacing:"-0.5px", flexShrink:0 }}>Ledger</span>
          <div className="nav-tabs">
            {["overview","transactions","insights"].map(tab => (
              <button key={tab} style={S.pill(activeTab === tab)} onClick={() => setActiveTab(tab)} className="btn-hover">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          {/* IMPROVED: hide role badge on small screens — saves space */}
          <span className="hide-xs" style={S.roleBadge(role)}>{role === "admin" ? "👑 Admin" : "👁 Viewer"}</span>
          <select style={{ ...S.select, width:"auto", padding:"6px 12px", fontSize:13 }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <button onClick={() => setDarkMode(d => !d)} style={{ background:"none", border:`1px solid ${border}`, borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:16, flexShrink:0 }} className="btn-hover" title="Toggle theme">
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* ══ MAIN ══ */}
      <main className="main-pad" style={{ maxWidth:1280, margin:"0 auto", padding:"28px 24px" }}>

        {/* ════ OVERVIEW ════ */}
        {activeTab === "overview" && (
          <div className="fade-up">
            <div style={{ marginBottom:28 }}>
              <h1 style={S.h1} className="page-h1">Financial Overview</h1>
              <p style={S.sub}>Your complete financial picture at a glance</p>
            </div>

            {/* IMPROVED: Skeleton while loading */}
            {isLoading ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
                {[0,1,2,3].map(i => <SkeletonCard key={i} surface2={surface2} shimmerColor={shimmer} height={118} />)}
              </div>
            ) : (
              // IMPROVED: staggered fade-up on cards + card-hover lift effect
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
                {[
                  { label:"Total Balance",  value:balance,      color:balance >= 0 ? ACCENT : DANGER, icon:"💰" },
                  { label:"Total Income",   value:totalIncome,  color:ACCENT2, icon:"📈" },
                  { label:"Total Expenses", value:totalExpense, color:DANGER,  icon:"📉" },
                  { label:"Savings Rate",   value:null, display:`${savingsRate}%`, color:INDIGO, icon:"🎯" },
                ].map((c, i) => (
                  <div key={i} className="card-hover fade-up" style={{ ...S.card, position:"relative", overflow:"hidden", animationDelay:`${i * 0.07}s` }}>
                    <div style={{ position:"absolute", top:0, right:0, width:80, height:80, background:`radial-gradient(circle at top right,${c.color}18,transparent)`, pointerEvents:"none" }} />
                    <div style={{ fontSize:22, marginBottom:10 }}>{c.icon}</div>
                    <div style={S.statLabel}>{c.label}</div>
                    <div className="stat-val" style={{ ...S.statValue, color:c.color }}>{c.display || fmtShort(Math.abs(c.value))}</div>
                    {c.value !== null && <div style={{ fontSize:12, color:muted, marginTop:4, fontFamily:"'DM Mono',monospace" }}>{fmt(c.value)}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* IMPROVED: skeleton for charts */}
            {isLoading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <SkeletonCard surface2={surface2} shimmerColor={shimmer} height={280} />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
                  <SkeletonCard surface2={surface2} shimmerColor={shimmer} height={200} />
                  <SkeletonCard surface2={surface2} shimmerColor={shimmer} height={200} />
                </div>
              </div>
            ) : (
              <>
                {/* IMPROVED: chart-2col collapses to 1 column on tablet via CSS */}
                <div className="chart-2col" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
                  <div style={S.card} className="card-hover">
                    <div style={{ marginBottom:18 }}><div style={S.statLabel}>Balance Trend</div><div style={{ fontSize:15, fontWeight:600, marginTop:4 }}>Monthly Income vs Expenses</div></div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="gIncome"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor={ACCENT2} stopOpacity={0.25}/><stop offset="95%" stopColor={ACCENT2} stopOpacity={0}/></linearGradient>
                          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor={DANGER}  stopOpacity={0.2} /><stop offset="95%" stopColor={DANGER}  stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                        <XAxis dataKey="month" tick={{ fill:muted, fontSize:12 }} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={fmtShort} tick={{ fill:muted, fontSize:11 }} axisLine={false} tickLine={false}/>
                        <Tooltip formatter={v => fmt(v)} contentStyle={S.tip}/>
                        <Area type="monotone" dataKey="income"  stroke={ACCENT2} fill="url(#gIncome)"  strokeWidth={2} dot={false} name="Income"/>
                        <Area type="monotone" dataKey="expense" stroke={DANGER}  fill="url(#gExpense)" strokeWidth={2} dot={false} name="Expenses"/>
                        <Legend/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={S.card} className="card-hover">
                    <div style={{ marginBottom:14 }}><div style={S.statLabel}>Spending Breakdown</div><div style={{ fontSize:15, fontWeight:600, marginTop:4 }}>By Category</div></div>
                    <ResponsiveContainer width="100%" height={165}>
                      <PieChart>
                        <Pie data={catData} cx="50%" cy="50%" innerRadius={46} outerRadius={74} paddingAngle={3} dataKey="value">
                          {catData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                        </Pie>
                        <Tooltip formatter={v => fmt(v)} contentStyle={S.tip}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop:8 }}>
                      {catData.slice(0,4).map((c,i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:i<3?`1px solid ${border}`:"none" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                            <span style={{ width:7, height:7, borderRadius:"50%", backgroundColor:PIE_COLORS[i], display:"inline-block", flexShrink:0 }}/>
                            {CAT_ICONS[c.name]} {c.name}
                          </div>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:muted }}>{fmtShort(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={S.card} className="card-hover">
                  <div style={{ marginBottom:18 }}><div style={S.statLabel}>Monthly Net Balance</div><div style={{ fontSize:15, fontWeight:600, marginTop:4 }}>Savings per Month</div></div>
                  <ResponsiveContainer width="100%" height={165}>
                    <BarChart data={monthlyData} barSize={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false}/>
                      <XAxis dataKey="month" tick={{ fill:muted, fontSize:12 }} axisLine={false} tickLine={false}/>
                      <YAxis tickFormatter={fmtShort} tick={{ fill:muted, fontSize:11 }} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={v => fmt(v)} contentStyle={S.tip}/>
                      <Bar dataKey="balance" name="Net Balance" radius={[6,6,0,0]}>
                        {monthlyData.map((m,i) => <Cell key={i} fill={m.balance >= 0 ? ACCENT : DANGER}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ TRANSACTIONS ════ */}
        {activeTab === "transactions" && (
          <div className="fade-up">
            {/* IMPROVED: txn-hdr stacks on mobile */}
            <div className="txn-hdr" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
              <div>
                <h1 style={S.h1} className="page-h1">Transactions</h1>
                <p style={S.sub}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button onClick={exportCSV} style={S.btn("secondary")} className="btn-hover">⬇ Export CSV</button>
                {role === "admin" && <button onClick={() => setShowAddModal(true)} style={S.btn("primary")} className="btn-hover">+ Add Transaction</button>}
              </div>
            </div>

            {/* IMPROVED: filter-bar stacks vertically on mobile via CSS class */}
            <div className="filter-bar" style={{ ...S.card, marginBottom:20, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", padding:16 }}>
              <input style={{ ...S.input, flex:1, minWidth:160 }} placeholder="🔍  Search description or category…" value={filters.search} onChange={e => setFilters(f => ({ ...f, search:e.target.value }))}/>
              <select style={S.select} value={filters.type}     onChange={e => setFilters(f => ({ ...f, type:     e.target.value }))}>
                <option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
              </select>
              <select style={S.select} value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
              <select style={S.select} value={filters.month}    onChange={e => setFilters(f => ({ ...f, month:    e.target.value }))}>
                <option value="all">All Months</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {(filters.search || filters.type !== "all" || filters.category !== "all" || filters.month !== "all") && (
                <button onClick={() => setFilters({ search:"", type:"all", category:"all", month:"all" })} style={{ ...S.btn("secondary"), padding:"10px 14px", color:DANGER }} className="btn-hover">✕ Clear</button>
              )}
            </div>

            <div style={{ ...S.card, padding:0, overflowX:"auto" }}>
              {filtered.length === 0 ? (
                // IMPROVED: enhanced empty state with contextual action
                <div style={{ padding:"56px 24px", textAlign:"center", color:muted }}>
                  <div style={{ width:58, height:58, borderRadius:18, backgroundColor:surface2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 14px" }}>🔍</div>
                  <div style={{ fontSize:16, fontWeight:700, color:text, marginBottom:6 }}>No transactions found</div>
                  <div style={{ fontSize:13, lineHeight:1.7 }}>
                    Try adjusting your filters{role === "admin" && <> or <span onClick={() => { setFilters({ search:"", type:"all", category:"all", month:"all" }); setShowAddModal(true); }} style={{ color:ACCENT, cursor:"pointer", textDecoration:"underline" }}>add a new transaction</span></>}
                  </div>
                </div>
              ) : (
                <table style={S.table}>
                  <thead>
                    <tr style={{ backgroundColor:surface2 }}>
                      {[["date","Date"],["description","Description"],["category","Category"],["type","Type"],["amount","Amount"]].map(([key,label]) => (
                        <th key={key} className={`th-hover${key==="category"||key==="type" ? " hide-xs" : ""}`} style={S.th} onClick={() => setSortConfig(s => ({ key, dir:s.key===key && s.dir==="asc" ? "desc" : "asc" }))}>
                          {label} <span style={{ opacity:sortConfig.key===key?1:0.3 }}>{sortConfig.key===key?(sortConfig.dir==="asc"?"↑":"↓"):"↕"}</span>
                        </th>
                      ))}
                      {role === "admin" && <th style={S.th}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} className="row-hover">
                        <td style={{ ...S.td, fontFamily:"'DM Mono',monospace", fontSize:12, color:muted, whiteSpace:"nowrap" }}>{t.date}</td>
                        <td style={{ ...S.td, fontWeight:500 }}>{t.description}</td>
                        <td style={S.td} className="hide-xs"><span style={S.tag}>{CAT_ICONS[t.category]} {t.category}</span></td>
                        <td style={S.td} className="hide-xs"><span style={S.badge(t.type)}>{t.type==="income"?"↑":"↓"} {t.type}</span></td>
                        <td style={{ ...S.td, fontFamily:"'DM Mono',monospace", fontWeight:700, color:t.type==="income"?ACCENT2:DANGER, whiteSpace:"nowrap" }}>
                          {t.type==="income"?"+":"−"}{fmt(t.amount)}
                        </td>
                        {role === "admin" && (
                          <td style={S.td}>
                            <div style={{ display:"flex", gap:8 }}>
                              <button onClick={() => setEditTxn(t)} style={{ background:"none", border:`1px solid ${border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:12, color:text }} className="btn-hover">Edit</button>
                              {/* IMPROVED: triggers confirm dialog — no more accidental deletes */}
                              <button onClick={() => requestDelete(t)} style={{ background:"none", border:`1px solid ${DANGER}44`, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontSize:12, color:DANGER }} className="btn-hover">Delete</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ════ INSIGHTS ════ */}
        {activeTab === "insights" && (
          <div className="fade-up">
            <div style={{ marginBottom:24 }}>
              <h1 style={S.h1} className="page-h1">Insights</h1>
              <p style={S.sub}>Patterns and observations from your financial data</p>
            </div>

            {/* IMPROVED: Smart data-driven insight banners — per-category MoM change */}
            {smartInsights.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {smartInsights.map((ins, i) => (
                  <div key={i} className="fade-up" style={{ backgroundColor:ins.pct>0?`${DANGER}0D`:`${ACCENT2}0D`, border:`1px solid ${ins.pct>0?DANGER:ACCENT2}2A`, borderLeft:`4px solid ${ins.pct>0?DANGER:ACCENT2}`, borderRadius:12, padding:"13px 18px", display:"flex", alignItems:"center", gap:14, animationDelay:`${i*0.08}s` }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{CAT_ICONS[ins.cat]}</span>
                    <div style={{ flex:1, fontSize:14, color:text, lineHeight:1.5 }}>
                      Your spending on <strong>{ins.cat}</strong>{" "}
                      <span style={{ color:ins.pct>0?DANGER:ACCENT2, fontWeight:700 }}>{ins.pct>0?`increased by ${ins.pct}%`:`decreased by ${Math.abs(ins.pct)}%`}</span>{" "}
                      <span style={{ color:muted, fontSize:13 }}>compared to last month — {fmtShort(ins.prev)} in {ins.prevM} → {fmtShort(ins.cur)} in {ins.lastM}</span>
                    </div>
                    <span style={{ fontSize:18, flexShrink:0 }}>{ins.pct>0?"📈":"📉"}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(275px,1fr))", gap:16, marginBottom:16 }}>
              {topCat && (
                <div style={S.card} className="card-hover">
                  <div style={{ fontSize:11, fontWeight:600, color:ACCENT, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>🏆 Highest Spending</div>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:50, height:50, borderRadius:14, backgroundColor:`${ACCENT}1A`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{CAT_ICONS[topCat.name]}</div>
                    <div>
                      <div style={{ fontSize:18, fontWeight:700 }}>{topCat.name}</div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, color:DANGER, marginTop:2 }}>{fmt(topCat.value)}</div>
                      <div style={{ fontSize:12, color:muted, marginTop:2 }}>{totalExpense>0?((topCat.value/totalExpense)*100).toFixed(1):0}% of total expenses</div>
                    </div>
                  </div>
                </div>
              )}
              {monthlyComparison && (
                <div style={S.card} className="card-hover">
                  <div style={{ fontSize:11, fontWeight:600, color:INDIGO, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>📊 Monthly Comparison</div>
                  <div style={{ fontSize:13, color:muted, marginBottom:10 }}>{monthlyComparison.prev.month} → {monthlyComparison.last.month}</div>
                  <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:14 }}>
                    <div><div style={{ fontSize:11, color:muted }}>Previous</div><div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:700, color:DANGER }}>{fmtShort(monthlyComparison.prev.expense)}</div></div>
                    <div style={{ fontSize:18, color:muted }}>→</div>
                    <div><div style={{ fontSize:11, color:muted }}>Current</div><div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:700, color:DANGER }}>{fmtShort(monthlyComparison.last.expense)}</div></div>
                  </div>
                  <div style={{ padding:"8px 12px", borderRadius:8, backgroundColor:monthlyComparison.diff>0?`${DANGER}12`:`${ACCENT2}12`, color:monthlyComparison.diff>0?DANGER:ACCENT2, fontSize:13, fontWeight:600 }}>
                    {monthlyComparison.diff>0?"↑":"↓"} Expenses {monthlyComparison.diff>0?"increased":"decreased"} by {Math.abs(+monthlyComparison.pct)}%
                  </div>
                </div>
              )}
              <div style={S.card} className="card-hover">
                <div style={{ fontSize:11, fontWeight:600, color:ACCENT2, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>💚 Savings Rate</div>
                <div style={{ position:"relative", height:8, backgroundColor:surface2, borderRadius:999, marginBottom:14, overflow:"hidden" }}>
                  <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${Math.min(Math.max(+savingsRate,0),100)}%`, background:`linear-gradient(90deg,${ACCENT2},${ACCENT})`, borderRadius:999, transition:"width 1.2s ease" }}/>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:30, fontWeight:700, color:+savingsRate>20?ACCENT2:+savingsRate>0?ACCENT:DANGER }}>{savingsRate}%</div>
                <div style={{ fontSize:13, color:muted, marginTop:6, lineHeight:1.5 }}>
                  {+savingsRate>30?"🎉 Excellent savings discipline":+savingsRate>20?"👍 Good savings rate":+savingsRate>0?"⚠️ Consider reducing expenses":"🚨 Spending exceeds income"}
                </div>
              </div>
            </div>

            <div style={{ ...S.card, marginBottom:16 }} className="card-hover">
              <div style={{ marginBottom:18 }}><div style={S.statLabel}>Category Analysis</div><div style={{ fontSize:15, fontWeight:600, marginTop:4 }}>Expense Distribution</div></div>
              <ResponsiveContainer width="100%" height={Math.max(catData.length * 38 + 16, 160)}>
                <BarChart data={catData} layout="vertical" barSize={17}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border} horizontal={false}/>
                  <XAxis type="number" tickFormatter={fmtShort} tick={{ fill:muted, fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fill:text, fontSize:12 }} axisLine={false} tickLine={false} width={112} tickFormatter={n => `${CAT_ICONS[n]} ${n}`}/>
                  <Tooltip formatter={v => fmt(v)} contentStyle={S.tip}/>
                  <Bar dataKey="value" radius={[0,6,6,0]}>
                    {catData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={S.card} className="card-hover">
              <div style={{ marginBottom:14 }}><div style={S.statLabel}>Income Sources</div><div style={{ fontSize:15, fontWeight:600, marginTop:4 }}>Revenue Breakdown</div></div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))", gap:12 }}>
                {INCOME_CATS.map((cat,i) => {
                  const total = transactions.filter(t => t.category === cat).reduce((s,t) => s + t.amount, 0);
                  if (!total) return null;
                  return (
                    <div key={i} className="card-hover" style={{ padding:14, backgroundColor:surface2, borderRadius:12, display:"flex", alignItems:"center", gap:12, transition:"box-shadow 0.2s, transform 0.2s" }}>
                      <div style={{ width:40, height:40, borderRadius:11, backgroundColor:`${PIE_COLORS[i]}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{CAT_ICONS[cat]}</div>
                      <div>
                        <div style={{ fontSize:12, color:muted, fontWeight:500 }}>{cat}</div>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:15, color:ACCENT2 }}>{fmtShort(total)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── OVERLAYS ── */}
      {(showAddModal || editTxn) && (
        <TxnModal txn={editTxn} onClose={() => { setShowAddModal(false); setEditTxn(null); }} onSave={editTxn ? updateTxn : addTxn} S={S} text={text} muted={muted} border={border} surface2={surface2}/>
      )}
      {/* IMPROVED: Confirm dialog before deleting */}
      {confirmDelete && (
        <ConfirmDialog message={`Are you sure you want to delete "${confirmDelete.description}"? This cannot be undone.`} onConfirm={confirmDeleteTxn} onCancel={() => setConfirmDelete(null)} surface={surface} surface2={surface2} textColor={text} border={border}/>
      )}
      {/* IMPROVED: Toast system — success/error/info with auto-dismiss */}
      <ToastContainer toasts={toasts} dismiss={dismissToast} surface={surface} border={border} textColor={text}/>
    </div>
  );
}

// ─── TRANSACTION MODAL ────────────────────────────────────────────────────────

function TxnModal({ txn, onClose, onSave, S, text, muted, border, surface2 }) {
  const [form, setForm] = useState(txn || { date:new Date().toISOString().split("T")[0], description:"", category:"Food", type:"expense", amount:"" });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  // IMPROVED: auto-correct category when type changes
  const handleTypeChange = (newType) => {
    const valid = newType === "income" ? INCOME_CATS : EXPENSE_CATS;
    set("type", newType);
    if (!valid.includes(form.category)) set("category", valid[0]);
  };

  const isValid = form.description.trim() && +form.amount > 0 && form.date;

  // IMPROVED: keyboard shortcuts — Enter submits, Escape closes
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Enter" && isValid && e.target.tagName !== "SELECT") onSave(form);
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [form, isValid, onSave, onClose]);

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox} className="fade-up">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:text }}>{txn ? "Edit Transaction" : "New Transaction"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:muted, lineHeight:1 }} title="Close (Esc)">×</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={S.fieldLabel}>Description</label>
            <input style={S.input} value={form.description} onChange={e => set("description", e.target.value)} placeholder="e.g. Grocery shopping" autoFocus/>
          </div>
          {/* IMPROVED: modal-2col stacks on mobile */}
          <div className="modal-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={S.fieldLabel}>Type</label>
              <select style={{ ...S.select, width:"100%" }} value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                <option value="income">Income</option><option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label style={S.fieldLabel}>Amount (₹)</label>
              <input style={S.input} type="number" value={form.amount} onChange={e => set("amount", +e.target.value)} placeholder="0" min="0"/>
            </div>
          </div>
          <div className="modal-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={S.fieldLabel}>Category</label>
              <select style={{ ...S.select, width:"100%" }} value={form.category} onChange={e => set("category", e.target.value)}>
                {(form.type === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.fieldLabel}>Date</label>
              <input style={S.input} type="date" value={form.date} onChange={e => set("date", e.target.value)}/>
            </div>
          </div>
          <div style={{ fontSize:11, color:muted, textAlign:"right", marginTop:-2 }}>Enter to save · Esc to cancel</div>
          <div style={{ display:"flex", gap:10, marginTop:2 }}>
            <button onClick={onClose} style={{ ...S.btn("secondary"), flex:1 }} className="btn-hover">Cancel</button>
            <button onClick={() => isValid && onSave(form)} style={{ ...S.btn("primary"), flex:1, opacity:isValid?1:0.4, cursor:isValid?"pointer":"not-allowed" }} disabled={!isValid} className="btn-hover">
              {txn ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
