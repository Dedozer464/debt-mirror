import { useState, useCallback, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

// ─── NCR RATE CAPS (South Africa) ───────────────────────────────────────────
const NCR_CAPS = {
  mortgage:      { label: "Mortgage Agreement",          addOn: 21.0 },
  unsecured:     { label: "Unsecured Credit",            addOn: 21.0 },
  facility:      { label: "Credit Facility",             addOn: 14.0 },
  shortterm:     { label: "Short-term Credit (≤6 mths)", addOn: null, flatMonthly: 5.0 },
  developmental: { label: "Developmental Credit",        addOn: 27.0 },
  other:         { label: "Other Credit Agreement",      addOn: 17.0 },
};

// ─── NEWTON-RAPHSON IRR SOLVER ───────────────────────────────────────────────
function solveIRR(principal, monthlyPayment, months, tolerance = 1e-10, maxIter = 1000) {
  if (monthlyPayment <= 0 || months <= 0 || principal <= 0) return null;
  let r = 0.01;
  for (let i = 0; i < maxIter; i++) {
    const pv = monthlyPayment * (1 - Math.pow(1 + r, -months)) / r;
    const f = pv - principal;
    const dpv = monthlyPayment * (
      (-months * Math.pow(1 + r, -months - 1) * r - (1 - Math.pow(1 + r, -months))) / (r * r)
    );
    const rNew = r - f / dpv;
    if (Math.abs(rNew - r) < tolerance) return rNew * 12 * 100;
    r = rNew;
    if (r <= 0) r = 0.0001;
  }
  return r * 12 * 100;
}

// ─── AMORTIZATION SCHEDULE ───────────────────────────────────────────────────
function buildSchedule(principal, monthlyRate, months, monthlyPayment) {
  const schedule = [];
  let balance = principal;
  let totalInterest = 0;
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    schedule.push({
      month: m,
      payment: monthlyPayment,
      interest: parseFloat(interest.toFixed(2)),
      principal: parseFloat(principalPaid.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
      cumulativeInterest: parseFloat(totalInterest.toFixed(2)),
    });
  }
  return schedule;
}

// ─── FORMATTERS ──────────────────────────────────────────────────────────────
const fmt = (n) => `R ${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n) => `${Number(n).toFixed(2)}%`;

// ─── VERDICT BADGE ───────────────────────────────────────────────────────────
function VerdictBadge({ level }) {
  const config = {
    SAFE:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "COMPLIANT",     icon: "✓" },
    WARNING: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "BORDERLINE",    icon: "⚠" },
    DANGER:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  label: "ILLEGAL RATE",  icon: "✕" },
  }[level] || { color: "#6b7280", bg: "rgba(107,114,128,0.12)", label: "UNKNOWN", icon: "?" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: config.bg, color: config.color,
      border: `1px solid ${config.color}40`,
      borderRadius: 4, padding: "3px 10px",
      fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700, letterSpacing: 2,
    }}>
      {config.icon} {config.label}
    </span>
  );
}

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────
function AnimNum({ value, formatter = fmt, duration = 800 }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef(null);
  useEffect(() => {
    const start = display;
    const end = value;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplay(start + (end - start) * eased);
      if (t < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <span>{formatter(display)}</span>;
}

// ─── AI ANALYSIS PANEL ───────────────────────────────────────────────────────
async function runAIAnalysis(loanData, onChunk, onDone, onError) {
  const systemPrompt = `You are a South African consumer credit compliance analyst specializing in NCR (National Credit Regulator) regulations and predatory lending detection, particularly targeting government employees (persal-deduction loans). Respond in plain JSON with keys: verdict (SAFE|WARNING|DANGER), summary (1-2 sentences), red_flags (array of strings, max 5), advice (array of strings, max 4), hidden_cost_score (0-100). No markdown fences.`;

  const userContent = `Analyse this loan:
Principal: R${loanData.principal}
Monthly Payment: R${loanData.monthlyPayment}  
Term: ${loanData.months} months
Stated Rate (APR): ${loanData.statedAPR}%
Calculated Effective APR (Newton-Raphson): ${loanData.effectiveAPR?.toFixed(2)}%
Loan Type: ${loanData.loanTypeLabel}
NCR Cap: ${loanData.ncrCap}%
NCR Violation: ${loanData.violated ? "YES — ILLEGAL" : "No"}
Total Cost: R${loanData.totalCost}
Total Interest: R${loanData.totalInterest}
Interest-to-Principal Ratio: ${((loanData.totalInterest / loanData.principal) * 100).toFixed(1)}%
SARB Repo Rate used: ${loanData.repoRate}%`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    const data = await resp.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      onDone(parsed);
    } catch {
      onError("AI returned unparseable response.");
    }
  } catch (e) {
    onError(e.message);
  }
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function DebtMirror() {
  const [repoRate, setRepoRate] = useState(8.25);
  const [loanType, setLoanType] = useState("unsecured");
  const [principal, setPrincipal] = useState(50000);
  const [statedAPR, setStatedAPR] = useState(29.5);
  const [months, setMonths] = useState(60);
  const [initFee, setInitFee] = useState(1207.5);
  const [monthlyFee, setMonthlyFee] = useState(69);
  const [insurance, setInsurance] = useState(150);
  const [tab, setTab] = useState("overview");
  const [ai, setAI] = useState({ loading: false, result: null, error: null });
  const [animKey, setAnimKey] = useState(0);

  // ── DERIVED CALCULATIONS ──────────────────────────────────────────────────
  const monthlyRate = statedAPR / 100 / 12;
  const monthlyPaymentBase = monthlyRate === 0
    ? principal / months
    : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  const monthlyPaymentTotal = monthlyPaymentBase + monthlyFee + insurance;

  const effectiveAPR = solveIRR(principal - initFee, monthlyPaymentTotal, months);

  const cap = NCR_CAPS[loanType];
  const ncrCap = cap.flatMonthly != null ? cap.flatMonthly * 12 : repoRate + cap.addOn;
  const violated = effectiveAPR != null && effectiveAPR > ncrCap;
  const borderline = !violated && effectiveAPR != null && effectiveAPR > ncrCap * 0.9;
  const verdictLevel = violated ? "DANGER" : borderline ? "WARNING" : "SAFE";

  const totalPaid = monthlyPaymentTotal * months;
  const totalInterest = totalPaid - principal;
  const interestRatio = (totalInterest / principal) * 100;

  const schedule = buildSchedule(principal, monthlyRate, months, monthlyPaymentBase);

  // Chart data — quarterly aggregation
  const chartData = schedule.filter((_, i) => i % 3 === 0 || i === schedule.length - 1).map(r => ({
    month: r.month,
    balance: r.balance,
    cumInterest: r.cumulativeInterest,
  }));
  const pieData = [
    { name: "Principal", value: parseFloat(principal) },
    { name: "Interest", value: parseFloat(Math.max(0, totalInterest).toFixed(2)) },
    { name: "Fees", value: parseFloat(((initFee + monthlyFee * months + insurance * months)).toFixed(2)) },
  ];

  const handleAnalyse = async () => {
    setAI({ loading: true, result: null, error: null });
    setTab("ai");
    await runAIAnalysis(
      { principal, monthlyPayment: monthlyPaymentTotal, months, statedAPR, effectiveAPR,
        loanTypeLabel: cap.label, ncrCap, violated, totalCost: totalPaid.toFixed(2),
        totalInterest: totalInterest.toFixed(2), repoRate },
      null,
      (r) => setAI({ loading: false, result: r, error: null }),
      (e) => setAI({ loading: false, result: null, error: e }),
    );
  };

  useEffect(() => setAnimKey(k => k + 1), [principal, statedAPR, months, loanType]);

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app: {
      minHeight: "100vh", background: "#0a0a0c",
      fontFamily: "'Sora', sans-serif",
      color: "#e2e8f0",
    },
    header: {
      borderBottom: "1px solid #1e1e28",
      padding: "0 32px",
      height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(10,10,14,0.95)",
      position: "sticky", top: 0, zIndex: 100,
    },
    logo: {
      display: "flex", alignItems: "center", gap: 10,
    },
    logoIcon: {
      width: 32, height: 32, borderRadius: 8,
      background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16,
    },
    logoText: {
      fontSize: 16, fontWeight: 700, letterSpacing: "-0.5px",
      background: "linear-gradient(90deg, #f8fafc, #94a3b8)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    },
    badge: {
      background: "#dc2626", color: "#fff", fontSize: 9,
      fontFamily: "'DM Mono', monospace", letterSpacing: 2,
      padding: "2px 6px", borderRadius: 3, fontWeight: 700,
    },
    main: {
      maxWidth: 1200, margin: "0 auto", padding: "32px 24px",
      display: "grid", gridTemplateColumns: "360px 1fr", gap: 24,
    },
    panel: {
      background: "#0f0f14", border: "1px solid #1e1e28", borderRadius: 12,
      padding: 24,
    },
    sectionLabel: {
      fontSize: 10, fontFamily: "'DM Mono', monospace",
      color: "#475569", letterSpacing: 3, fontWeight: 600,
      marginBottom: 16, textTransform: "uppercase",
    },
    field: { marginBottom: 16 },
    label: { fontSize: 12, color: "#64748b", marginBottom: 6, display: "block" },
    input: {
      width: "100%", background: "#141420", border: "1px solid #1e1e28",
      borderRadius: 8, padding: "10px 14px", color: "#e2e8f0",
      fontSize: 14, fontFamily: "'DM Mono', monospace",
      outline: "none", boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    select: {
      width: "100%", background: "#141420", border: "1px solid #1e1e28",
      borderRadius: 8, padding: "10px 14px", color: "#e2e8f0",
      fontSize: 13, outline: "none", boxSizing: "border-box",
      appearance: "none", cursor: "pointer",
    },
    statGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24,
    },
    stat: (danger) => ({
      background: danger ? "rgba(220,38,38,0.06)" : "#0f0f14",
      border: `1px solid ${danger ? "rgba(220,38,38,0.3)" : "#1e1e28"}`,
      borderRadius: 10, padding: "16px",
    }),
    statLabel: { fontSize: 10, color: "#475569", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 6 },
    statValue: (danger) => ({
      fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono', monospace",
      color: danger ? "#ef4444" : "#f8fafc",
    }),
    analyseBtn: {
      width: "100%", padding: "14px", borderRadius: 10, border: "none",
      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
      color: "#fff", fontSize: 14, fontWeight: 700,
      cursor: "pointer", letterSpacing: 0.5,
      boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
      transition: "all 0.2s",
      fontFamily: "'Sora', sans-serif",
    },
    tabs: {
      display: "flex", gap: 4, marginBottom: 24,
      background: "#0f0f14", borderRadius: 10, padding: 4,
      border: "1px solid #1e1e28",
    },
    tab: (active) => ({
      flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
      background: active ? "#1e1e28" : "transparent",
      color: active ? "#f8fafc" : "#475569",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: "'Sora', sans-serif",
      transition: "all 0.2s", letterSpacing: 0.3,
    }),
    ncrBar: {
      background: "#141420", borderRadius: 10, padding: 16,
      border: "1px solid #1e1e28", marginBottom: 20,
    },
    progressBg: {
      height: 8, background: "#1e1e28", borderRadius: 4, overflow: "hidden", marginTop: 8,
    },
    separator: { borderTop: "1px solid #1e1e28", margin: "20px 0" },
  };

  const ncrPct = effectiveAPR != null ? Math.min((effectiveAPR / ncrCap) * 100, 120) : 0;
  const ncrColor = violated ? "#ef4444" : borderline ? "#f59e0b" : "#22c55e";

  return (
    <div style={S.app}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}>◈</div>
          <span style={S.logoText}>Debt Mirror</span>
          <span style={S.badge}>v2</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
            SARB Repo: <span style={{ color: "#94a3b8" }}>{repoRate}%</span>
          </span>
          <VerdictBadge level={verdictLevel} />
        </div>
      </header>

      <div style={S.main}>
        {/* LEFT — LOAN INPUT */}
        <aside>
          <div style={S.panel}>
            <div style={S.sectionLabel}>Loan Configuration</div>

            <div style={S.field}>
              <label style={S.label}>Loan Type</label>
              <select style={S.select} value={loanType} onChange={e => setLoanType(e.target.value)}>
                {Object.entries(NCR_CAPS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {[
              { label: "Principal Amount (R)", val: principal, set: setPrincipal, min: 500 },
              { label: "Stated APR (%)", val: statedAPR, set: setStatedAPR, min: 0.1, step: 0.1 },
              { label: "Term (months)", val: months, set: setMonths, min: 1, max: 360 },
            ].map(({ label, val, set, min, max, step = 1 }) => (
              <div key={label} style={S.field}>
                <label style={S.label}>{label}</label>
                <input
                  type="number" style={S.input}
                  value={val} min={min} max={max} step={step}
                  onChange={e => set(parseFloat(e.target.value) || 0)}
                  onFocus={e => e.target.style.borderColor = "#3b3b50"}
                  onBlur={e => e.target.style.borderColor = "#1e1e28"}
                />
              </div>
            ))}

            <div style={S.separator} />
            <div style={S.sectionLabel}>Fees & Extras</div>

            {[
              { label: "Initiation Fee (R)", val: initFee, set: setInitFee },
              { label: "Monthly Service Fee (R)", val: monthlyFee, set: setMonthlyFee },
              { label: "Monthly Insurance (R)", val: insurance, set: setInsurance },
              { label: "SARB Repo Rate (%)", val: repoRate, set: setRepoRate, step: 0.25 },
            ].map(({ label, val, set, step = 1 }) => (
              <div key={label} style={S.field}>
                <label style={S.label}>{label}</label>
                <input
                  type="number" style={S.input}
                  value={val} step={step}
                  onChange={e => set(parseFloat(e.target.value) || 0)}
                  onFocus={e => e.target.style.borderColor = "#3b3b50"}
                  onBlur={e => e.target.style.borderColor = "#1e1e28"}
                />
              </div>
            ))}

            <div style={S.separator} />

            {/* NCR compliance bar */}
            <div style={S.ncrBar}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>NCR CAP</span>
                <span style={{ fontSize: 12, color: ncrColor, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                  {fmtPct(ncrCap)}
                </span>
              </div>
              <div style={S.progressBg}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: `${Math.min(ncrPct, 100)}%`,
                  background: `linear-gradient(90deg, #22c55e, ${ncrColor})`,
                  transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: "#334155", fontFamily: "'DM Mono', monospace" }}>0%</span>
                <span style={{ fontSize: 10, color: ncrColor, fontFamily: "'DM Mono', monospace" }}>
                  Effective: {effectiveAPR != null ? fmtPct(effectiveAPR) : "N/A"}
                </span>
              </div>
            </div>

            <button style={S.analyseBtn} onClick={handleAnalyse}
              onMouseEnter={e => e.target.style.boxShadow = "0 4px 30px rgba(220,38,38,0.5)"}
              onMouseLeave={e => e.target.style.boxShadow = "0 4px 20px rgba(220,38,38,0.3)"}>
              ◈ Run AI Compliance Analysis
            </button>
          </div>
        </aside>

        {/* RIGHT — RESULTS */}
        <main>
          {/* STAT GRID */}
          <div style={S.statGrid}>
            {[
              { label: "MONTHLY TOTAL",   val: monthlyPaymentTotal,  fmt: fmt,    danger: false },
              { label: "EFFECTIVE APR",   val: effectiveAPR ?? 0,    fmt: fmtPct, danger: violated },
              { label: "TOTAL REPAID",    val: totalPaid,            fmt: fmt,    danger: false },
              { label: "TOTAL INTEREST",  val: Math.max(0, totalInterest), fmt: fmt, danger: totalInterest > principal },
            ].map(({ label, val, fmt: f, danger }) => (
              <div key={label} style={S.stat(danger)}>
                <div style={S.statLabel}>{label}</div>
                <div style={S.statValue(danger)}>
                  <AnimNum key={`${animKey}-${label}`} value={val} formatter={f} />
                </div>
              </div>
            ))}
          </div>

          {/* NCR VIOLATION BANNER */}
          {violated && (
            <div style={{
              background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 10, padding: "14px 18px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>⚠</span>
              <div>
                <div style={{ fontWeight: 700, color: "#ef4444", fontSize: 13 }}>NCR Cap Violated</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  Effective APR of {fmtPct(effectiveAPR ?? 0)} exceeds the legal maximum of {fmtPct(ncrCap)} for {cap.label}.
                  This loan may be unenforceable under the National Credit Act.
                </div>
              </div>
            </div>
          )}

  
