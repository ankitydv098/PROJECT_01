import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Home, Utensils, Bus, Pill, Film, ShoppingBag, Briefcase, Laptop, TrendingUp,
  Search, Plus, Download, Moon, Sun, ShieldCheck, Eye, X, AlertTriangle, ChevronDown, Check, Info, Trash2, Edit2
} from "lucide-react";

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Housing", "Food", "Transport", "Health", "Entertainment", "Shopping", "Salary", "Freelance", "Investment"];
const CAT_ICONS = { 
  Housing: <Home size={16} />, Food: <Utensils size={16} />, Transport: <Bus size={16} />, 
  Health: <Pill size={16} />, Entertainment: <Film size={16} />, Shopping: <ShoppingBag size={16} />, 
  Salary: <Briefcase size={16} />, Freelance: <Laptop size={16} />, Investment: <TrendingUp size={16} /> 
};
const EXPENSE_CATS = ["Housing", "Food", "Transport", "Health", "Entertainment", "Shopping"];
const INCOME_CATS = ["Salary", "Freelance", "Investment"];

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
  { id:16, date:"2025-11-01", description:"Monthly Salary",         category:"Salary",        type:"income",  amount:85000 },
  { id:17, date:"2025-11-02", description:"Rent Payment",           category:"Housing",       type:"expense", amount:22000 },
  { id:18, date:"2025-11-05", description:"Grocery Store",          category:"Food",          type:"expense", amount:2800  },
  { id:19, date:"2025-11-07", description:"Cab to Airport",         category:"Transport",     type:"expense", amount:2200  },
  { id:20, date:"2025-11-10", description:"Freelance Project",      category:"Freelance",     type:"income",  amount:22000 },
  { id:29, date:"2025-12-01", description:"Monthly Salary",         category:"Salary",        type:"income",  amount:90000 },
  { id:30, date:"2025-12-02", description:"Rent Payment",           category:"Housing",       type:"expense", amount:22000 },
  { id:31, date:"2025-12-04", description:"Grocery Store",          category:"Food",          type:"expense", amount:4100  },
  { id:32, date:"2025-12-06", description:"Freelance Design",       category:"Freelance",     type:"income",  amount:30000 },
  { id:34, date:"2025-12-10", description:"Holiday Shopping",       category:"Shopping",      type:"expense", amount:12000 },
];

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#ec4899", "#f97316"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;
const getMonth = (d) => new Date(d).toLocaleString("default", { month: "short", year: "2-digit" });

const buildCatMonthMap = (txns) => {
  const map = {};
  txns.filter(t => t.type === "expense").forEach(t => {
    const key = `${t.category}:${getMonth(t.date)}`;
    map[key] = (map[key] || 0) + t.amount;
  });
  return map;
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Button({ children, variant = "primary", onClick, icon, disabled, className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 shadow-[var(--shadow-sm)]",
    secondary: "bg-[var(--surface-hover)] text-[var(--fg)] hover:bg-[var(--border)] border border-[var(--border)]",
    danger: "bg-[var(--danger)] text-white hover:opacity-90 shadow-[var(--shadow-sm)]",
    ghost: "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]"
  };

  return (
    <motion.button 
      whileHover={{ scale: disabled ? 1 : 0.98 }} 
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="opacity-80">{icon}</span>}
      {children}
    </motion.button>
  );
}

function Card({ children, className = "", noPad = false }) {
  return (
    <div className={`glass-panel overflow-hidden transition-shadow hover:shadow-[var(--shadow-md)] ${noPad ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [role, setRole] = useState("admin");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState(() => {
    try { const s = localStorage.getItem("fin_txns"); return s ? JSON.parse(s) : SEED_TRANSACTIONS; }
    catch { return SEED_TRANSACTIONS; }
  });
  const [filters, setFilters] = useState({ search: "", type: "all", category: "all", month: "all" });
  const [sortConfig, setSortConfig] = useState({ key: "date", dir: "desc" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  
  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("fin_txns", JSON.stringify(transactions));
  }, [transactions]);

  // Derived Stats
  const totalIncome = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const m = getMonth(t.date);
      if (!map[m]) map[m] = { month: m, income: 0, expense: 0 };
      if (t.type === "income") map[m].income += t.amount; else map[m].expense += t.amount;
    });
    return Object.values(map).map(m => ({ ...m, balance: m.income - m.expense }));
  }, [transactions]);

  const catData = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topCat = catData[0];

  const filtered = useMemo(() => {
    let list = [...transactions];
    const q = filters.search.toLowerCase();
    if (q) list = list.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    if (filters.type !== "all") list = list.filter(t => t.type === filters.type);
    if (filters.category !== "all") list = list.filter(t => t.category === filters.category);
    if (filters.month !== "all") list = list.filter(t => getMonth(t.date) === filters.month);
    list.sort((a, b) => {
      let av = a[sortConfig.key], bv = b[sortConfig.key];
      if (sortConfig.key === "amount") { av = +av; bv = +bv; }
      if (sortConfig.key === "date") { av = new Date(av); bv = new Date(bv); }
      return av < bv ? (sortConfig.dir === "asc" ? -1 : 1) : av > bv ? (sortConfig.dir === "asc" ? 1 : -1) : 0;
    });
    return list;
  }, [transactions, filters, sortConfig]);

  const months = useMemo(() => [...new Set(transactions.map(t => getMonth(t.date)))], [transactions]);

  const TABS = ["overview", "transactions", "insights"];

  // Custom styles definition inside component
  const styles = {
    badge: (type) => ({
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
      backgroundColor: type === "income" ? 'var(--success-bg)' : 'var(--danger-bg)',
      color: type === "income" ? 'var(--success)' : 'var(--danger)'
    }),
    th: { padding: "16px 24px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" },
    td: { padding: "16px 24px", fontSize: "0.875rem", borderBottom: "1px solid var(--border)" },
    input: { width: "100%", backgroundColor: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--fg)", fontSize: "0.875rem", outline: "none", transition: "all 0.2s" },
    label: { fontSize: "0.75rem", fontWeight: 500, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "block" }
  };

  return (
    <>
      {/* Top Navigation */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--fg)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={16} strokeWidth={3} />
              </div>
              <span style={{ fontWeight: 600, fontSize: "1.125rem", letterSpacing: "-0.03em" }}>Ledger</span>
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    position: "relative",
                    padding: "6px 14px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: activeTab === tab ? "var(--fg)" : "var(--fg-muted)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "color 0.2s"
                  }}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="nav-pill"
                      style={{ position: "absolute", inset: 0, background: "var(--surface-hover)", borderRadius: "6px", zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "var(--surface-hover)", borderRadius: "6px", border: "1px solid var(--border)" }}>
              {role === "admin" ? <ShieldCheck size={14} color="var(--success)" /> : <Eye size={14} color="var(--info)" />}
              <select style={{ background: "transparent", border: "none", color: "var(--fg)", fontSize: "0.75rem", fontWeight: 500, outline: "none", cursor: "pointer", appearance: "none" }} value={role} onChange={e => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px", color: "var(--fg-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px", minHeight: "calc(100vh - 64px)" }}>
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Financial Overview</h1>
                <p style={{ color: "var(--fg-muted)" }}>Your complete financial picture at a glance</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                {isLoading ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="shimmer glass-panel" style={{ height: "135px" }} />)
                ) : (
                  [
                    { label: "Total Balance", value: balance, color: balance >= 0 ? "var(--accent)" : "var(--danger)", icon: <Briefcase size={20} /> },
                    { label: "Total Income", value: totalIncome, color: "var(--success)", icon: <TrendingUp size={20} /> },
                    { label: "Total Expenses", value: totalExpense, color: "var(--danger)", icon: <TrendingUp size={20} style={{ transform: 'scaleY(-1)' }} /> },
                    { label: "Savings Rate", value: null, display: `${savingsRate}%`, color: "var(--info)", icon: <ShieldCheck size={20} /> },
                  ].map((stat, i) => (
                    <Card key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div style={{ color: stat.color, padding: "8px", background: `var(--surface-hover)`, borderRadius: "8px" }}>
                          {stat.icon}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--fg-muted)", marginBottom: "4px" }}>{stat.label}</div>
                      <div style={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.03em" }}>{stat.display || fmtShort(stat.value)}</div>
                      {stat.value !== null && <div className="mono" style={{ fontSize: "0.75rem", color: "var(--border-hover)", marginTop: "4px", opacity: 0.6 }}>{fmt(stat.value)}</div>}
                    </Card>
                  ))
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <Card>
                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Balance Trend</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--fg-muted)" }}>Monthly Income vs Expenses</p>
                  </div>
                  <div style={{ height: "260px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--success)" stopOpacity={0}/></linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--fg-muted)" }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={fmtShort} tick={{ fontSize: 12, fill: "var(--fg-muted)" }} />
                        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-md)" }} formatter={v => <span className="mono">{fmt(v)}</span>} />
                        <Area type="monotone" dataKey="income" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="var(--danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Spending Breakdown</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--fg-muted)" }}>By Category</p>
                  </div>
                  <div style={{ height: "180px", marginBottom: "16px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                          {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow-md)" }} formatter={v => <span className="mono">{fmt(v)}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {catData.slice(0, 3).map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span style={{ fontSize: "0.875rem", color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: "6px" }}>{CAT_ICONS[c.name]} {c.name}</span>
                        </div>
                        <span className="mono" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{fmtShort(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Transactions</h1>
                  <p style={{ color: "var(--fg-muted)" }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button variant="secondary" icon={<Download size={16} />}>Export</Button>
                  {role === "admin" && <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Add Transaction</Button>}
                </div>
              </div>

              <Card style={{ marginBottom: "24px", padding: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--border-hover)" }} />
                  <input 
                    style={{ ...styles.input, paddingLeft: "36px" }} 
                    placeholder="Search transactions..." 
                    value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                    className="focus-ring"
                  />
                </div>
                <select style={{ ...styles.input, width: "auto" }} value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                  <option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
                </select>
                <select style={{ ...styles.input, width: "auto" }} value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Card>

              <Card noPad>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-hover)" }}>
                        {["Date", "Description", "Category", "Type", "Amount"].map((label, i) => (
                          <th key={label} style={styles.th}>{label}</th>
                        ))}
                        {role === "admin" && <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody style={{ position: "relative" }}>
                      <AnimatePresence>
                        {filtered.map((t, i) => (
                          <motion.tr 
                            key={t.id} 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.02, duration: 0.2 }}
                            style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
                            onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
                          >
                            <td style={{ ...styles.td, color: "var(--fg-muted)" }} className="mono">{t.date}</td>
                            <td style={{ ...styles.td, fontWeight: 500 }}>{t.description}</td>
                            <td style={styles.td}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--fg-muted)", background: "var(--surface-hover)", padding: "4px 10px", borderRadius: "12px", width: "fit-content", fontSize: "0.75rem", fontWeight: 500 }}>
                                {CAT_ICONS[t.category]} {t.category}
                              </div>
                            </td>
                            <td style={styles.td}><span style={styles.badge(t.type)}>{t.type}</span></td>
                            <td style={{ ...styles.td, fontWeight: 600, color: t.type === "income" ? "var(--success)" : "var(--fg)" }} className="mono">
                              {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                            </td>
                            {role === "admin" && (
                              <td style={{ ...styles.td, textAlign: "right" }}>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                  <button style={{ color: "var(--fg-muted)", background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}><Edit2 size={16} /></button>
                                  <button style={{ color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", padding: "4px" }} onClick={() => setTransactions(p => p.filter(x => x.id !== t.id))}><Trash2 size={16} /></button>
                                </div>
                              </td>
                            )}
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--fg-muted)" }}>
                      <AlertTriangle size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
                      <p style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--fg)" }}>No transactions found</p>
                      <p style={{ fontSize: "0.875rem", marginTop: "4px" }}>Try adjusting your filters or search query.</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
          
          {/* INSIGHTS */}
          {activeTab === "insights" && (
             <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Insights</h1>
                <p style={{ color: "var(--fg-muted)" }}>Deep dive into your financial habits</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                
                <Card>
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--warning)", marginBottom: "8px" }}><TrendingUp size={16}/> <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Top Spending Category</span></div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 600 }}>{topCat?.name || "N/A"}</h3>
                  </div>
                  <div style={{ fontSize: "1.25rem", color: "var(--fg-muted)" }} className="mono">{fmt(topCat?.value || 0)}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--border-hover)", marginTop: "4px" }}>{((topCat?.value / totalExpense) * 100 || 0).toFixed(1)}% of total expenses</div>
                </Card>
                
                <Card>
                   <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--success)", marginBottom: "8px" }}><ShieldCheck size={16}/> <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Financial Health</span></div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 600 }}>{savingsRate > 20 ? "Excellent" : savingsRate > 0 ? "Good" : "Needs Attention"}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>{savingsRate}%</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--fg-muted)", paddingBottom: "4px" }}>Savings Rate</div>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "var(--surface-hover)", borderRadius: "99px", marginTop: "16px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", background: "var(--success)", borderRadius: "99px" }} />
                  </div>
                </Card>

              </div>
             </motion.div>
          )}

        </AnimatePresence>
      </main>
      
      {/* ADD/EDIT MODAL overlay */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "32px", boxShadow: "var(--shadow-lg)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Add Transaction</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", color: "var(--fg-muted)", cursor: "pointer", padding: "4px" }} className="focus-ring"><X size={20}/></button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={styles.label}>Description</label>
                  <input style={styles.input} className="focus-ring" placeholder="e.g. Grocery shopping" />
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                     <label style={styles.label}>Type</label>
                     <select style={styles.input} className="focus-ring"><option>Expense</option><option>Income</option></select>
                  </div>
                  <div style={{ flex: 1 }}>
                     <label style={styles.label}>Amount</label>
                     <input style={styles.input} className="focus-ring" type="number" placeholder="0.00" />
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: "32px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button variant="primary">Add Transaction</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}