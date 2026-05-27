import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v) =>
  "R" + Number(v).toLocaleString("en-ZA", { maximumFractionDigits: 0 });

const calcMonthlyRate = (principal, payment, months) => {
  if (payment * months <= principal) return 0;
  let r = 0.05;
  for (let i = 0; i < 200; i++) {
    const pow = Math.pow(1 + r, months);
    const f = (principal * r * pow) / (pow - 1) - payment;
    const df = principal * (pow * (1 + r * months) - pow + 1) / Math.pow(pow - 1, 2);
    if (!isFinite(f) || !isFinite(df) || df === 0) break;
    const next = r - f / df;
    if (Math.abs(next - r) < 0.000001) { r = next; break; }
    r = Math.max(0.001, next);
  }
  return r;
};

const buildLoanSchedule = (principal, payment, months) => {
  const r = calcMonthlyRate(principal, payment, months);
  let balance = principal;
  const rows = [];
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const toward = Math.min(payment - interest, balance);
    balance = Math.max(0, balance - toward);
    rows.push({
      month: m,
      balance: Math.round(balance),
      interestPaid: Math.round(interest),
      principalPaid: Math.round(toward),
    });
  }
  return { rows, rate: r };
};

const buildSpiralData = (principal, payment, months, salary) => {
  const { rows, rate } = buildLoanSchedule(principal, payment, months);
  const data = rows.map((r, i) => ({
    month: i + 1,
    single: principal - (principal - rows[i].balance),
    balance: rows[i].balance,
    label: `Month ${i + 1}`,
  }));

  const mid = Math.floor(months / 2);
  const spiralData = [];
  let bal1 = principal;
  let bal2 = 0;
  let spiralStarted = false;
  for (let m = 1; m <= months * 1.8; m++) {
    const int1 = bal1 * rate;
    bal1 = Math.max(0, bal1 - (payment - int1));
    if (m === mid) { bal2 = principal; spiralStarted = true; }
    if (spiralStarted && bal2 > 0) {
      const int2 = bal2 * rate;
      bal2 = Math.max(0, bal2 - (payment - int2));
    }
    spiralData.push({
      month: m,
      single: m <= months ? Math.round(bal1) : null,
      spiral: Math.round(bal1 + bal2),
    });
  }
  return { schedule: data, spiralData, rate };
};

const ALTERNATIVES = [
  { emoji: "🛒", label: "months of groceries for your family", unit: 3200 },
  { emoji: "📚", label: "years of school fees (govt school)", unit: 800, isYear: true },
  { emoji: "⚡", label: "months of electricity", unit: 700 },
  { emoji: "💊", label: "months of chronic medication", unit: 500 },
  { emoji: "📱", label: "months of data & airtime", unit: 260 },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ target, duration = 1200, prefix = "R" }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    start.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return (
    <span>
      {prefix}{display.toLocaleString("en-ZA")}
    </span>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #1565C0",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 13,
      color: "#1a1a2e",
      fontWeight: 700,
      boxShadow: "0 2px 12px rgba(21,101,192,0.12)"
    }}>
      <div style={{ marginBottom: 4, color: "#1565C0", fontWeight: 700 }}>Month {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: R{Number(p.value).toLocaleString("en-ZA")}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DebtMirror() {
  const [step, setStep] = useState("input");
  const [form, setForm] = useState({
    principal: "",
    payment: "",
    months: "",
    salary: "",
    monthsPaid: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCalculate = () => {
    const p = parseFloat(form.principal);
    const pay = parseFloat(form.payment);
    const m = parseInt(form.months);
    const sal = parseFloat(form.salary) || 0;
    const paid = parseInt(form.monthsPaid) || 0;

    if (!p || !pay || !m) { setError("Please fill in all required fields."); return; }
    if (pay * m < p) { setError("Your total repayments seem lower than what you borrowed. Check your numbers."); return; }
    if (paid >= m) { setError("Months already paid can't exceed total loan term."); return; }

    const totalRepayment = pay * m;
    const totalInterest = totalRepayment - p;
    const alreadyPaid = pay * paid;
    const remaining = pay * (m - paid);
    const { schedule, spiralData, rate } = buildSpiralData(p, pay, m, sal);
    const annualRate = (Math.pow(1 + rate, 12) - 1) * 100;

    setResult({
      principal: p, payment: pay, months: m, salary: sal,
      monthsPaid: paid, totalRepayment, totalInterest,
      alreadyPaid, remaining, spiralData, annualRate,
      percentInterest: (totalInterest / totalRepayment) * 100,
    });
    setStep("result");
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const S = {
    root: {
      minHeight: "100vh",
      background: "#ffffff",
      color: "#1a1a2e",
      fontFamily: "'DM Serif Display', Georgia, serif",
      padding: "0 0 80px 0",
    },
    header: {
      borderBottom: "2px solid #1565C0",
      padding: "28px 24px 24px",
      background: "linear-gradient(180deg, #e3f0ff 0%, #ffffff 100%)",
    },
    logo: {
      fontSize: 11,
      letterSpacing: "0.3em",
      color: "#1565C0",
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
      marginBottom: 8,
      fontWeight: 700,
    },
    title: {
      fontSize: "clamp(28px, 5vw, 42px)",
      fontWeight: 700,
      lineHeight: 1.15,
      margin: 0,
      color: "#1565C0",
    },
    subtitle: {
      marginTop: 8,
      fontSize: 14,
      color: "#1976D2",
      fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.02em",
      fontWeight: 700,
    },
    card: {
      background: "#f4f8ff",
      border: "1.5px solid #90CAF9",
      borderRadius: 12,
      padding: "28px 24px",
      marginBottom: 16,
    },
    label: {
      display: "block",
      fontSize: 11,
      letterSpacing: "0.2em",
      color: "#1565C0",
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
      marginBottom: 8,
      fontWeight: 700,
    },
    input: {
      width: "100%",
      background: "#ffffff",
      border: "1.5px solid #90CAF9",
      borderRadius: 8,
      padding: "14px 16px",
      color: "#1a1a2e",
      fontSize: 20,
      fontFamily: "'DM Mono', monospace",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      fontWeight: 700,
    },
    btn: {
      width: "100%",
      background: "#1565C0",
      color: "#ffffff",
      border: "none",
      borderRadius: 8,
      padding: "18px",
      fontSize: 16,
      fontFamily: "'DM Serif Display', Georgia, serif",
      fontWeight: 700,
      cursor: "pointer",
      letterSpacing: "0.05em",
      marginTop: 8,
      transition: "background 0.2s",
    },
    sectionLabel: {
      fontSize: 10,
      letterSpacing: "0.3em",
      color: "#1565C0",
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
      marginBottom: 12,
      fontWeight: 700,
    },
    bigNumber: {
      fontSize: "clamp(36px, 8vw, 60px)",
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: "-0.02em",
    },
    redNumber: { color: "#D32F2F", fontWeight: 700 },
    blueNumber: { color: "#1565C0", fontWeight: 700 },
    greenNumber: { color: "#2a9d8f", fontWeight: 700 },
    divider: {
      border: "none",
      borderTop: "1.5px solid #90CAF9",
      margin: "20px 0",
    },
    altRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 0",
      borderBottom: "1px solid #BBDEFB",
    },
    backBtn: {
      background: "transparent",
      border: "1.5px solid #1565C0",
      borderRadius: 8,
      color: "#1565C0",
      padding: "10px 20px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      cursor: "pointer",
      marginBottom: 20,
      letterSpacing: "0.1em",
      fontWeight: 700,
    },
    exitCard: {
      background: "linear-gradient(135deg, #e3f2fd 0%, #f4f8ff 100%)",
      border: "1.5px solid #1565C0",
      borderRadius: 12,
      padding: "28px 24px",
    },
  };

  // ── Input Screen ──────────────────────────────────────────────────────────

  if (step === "input") return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <div style={S.root}>
        <div style={S.header}>
          <div style={S.logo}>Debt Mirror · South Africa</div>
          <h1 style={S.title}>See what your<br />loan is really costing you.</h1>
          <p style={S.subtitle}>No judgement. Just the truth.</p>
        </div>

        <div style={{ padding: "24px 16px 0" }}>
          <div style={S.card}>
            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>How much did you borrow? *</label>
              <input
                style={S.input}
                name="principal"
                type="number"
                placeholder="R 5 000"
                value={form.principal}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>What do you pay back every month? *</label>
              <input
                style={S.input}
                name="payment"
                type="number"
                placeholder="R 900"
                value={form.payment}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Total number of months to repay *</label>
              <input
                style={S.input}
                name="months"
                type="number"
                placeholder="18"
                value={form.months}
                onChange={handleChange}
              />
            </div>

            <hr style={S.divider} />

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>How many months have you already paid? (optional)</label>
              <input
                style={S.input}
                name="monthsPaid"
                type="number"
                placeholder="0"
                value={form.monthsPaid}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={S.label}>Your monthly salary (optional — for context)</label>
              <input
                style={S.input}
                name="salary"
                type="number"
                placeholder="R 12 000"
                value={form.salary}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: "#fff5f5", border: "1.5px solid #D32F2F",
              borderRadius: 8, padding: "12px 16px",
              color: "#D32F2F", fontSize: 13,
              fontFamily: "'DM Mono', monospace",
              marginBottom: 16,
              fontWeight: 700,
            }}>
              {error}
            </div>
          )}

          <button style={S.btn} onClick={handleCalculate}>
            Show Me The Truth →
          </button>

          {/* ── DISCLAIMER ── */}
          <p style={{
            textAlign: "center", marginTop: 16,
            fontSize: 12,
            color: "#D32F2F",
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.05em",
            fontWeight: 700,
            lineHeight: 1.6,
          }}>
            ⚠️ DISCLAIMER: Your information stays on this device. Nothing is stored or shared. This tool is for educational purposes only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </>
  );

  // ── Results Screen ────────────────────────────────────────────────────────

  if (step === "result" && result) {
    const { principal, payment, months, salary, monthsPaid,
      totalRepayment, totalInterest, remaining,
      spiralData, annualRate, percentInterest } = result;

    const interestRatio = totalInterest / principal;

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={S.root}>
          <div style={S.header}>
            <div style={S.logo}>Debt Mirror · Your Results</div>
            <h1 style={S.title}>Here is where<br />you actually stand.</h1>
          </div>

          <div style={{ padding: "24px 16px 0" }}>
            <button style={S.backBtn} onClick={() => setStep("input")}>
              ← Recalculate
            </button>

            {/* ── SECTION 1: The True Cost ── */}
            <div style={S.card}>
              <div style={S.sectionLabel}>What this loan actually costs you</div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#1565C0", fontFamily: "'DM Mono', monospace", marginBottom: 4, fontWeight: 700 }}>
                  You borrowed
                </div>
                <div style={{ ...S.bigNumber, ...S.blueNumber }}>
                  <AnimatedNumber target={principal} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#1565C0", fontFamily: "'DM Mono', monospace", marginBottom: 4, fontWeight: 700 }}>
                  You will pay back
                </div>
                <div style={{ ...S.bigNumber, ...S.redNumber }}>
                  <AnimatedNumber target={totalRepayment} duration={1600} />
                </div>
              </div>

              <div style={{
                background: "#fff5f5",
                border: "1.5px solid #D32F2F",
                borderRadius: 8,
                padding: "16px",
                marginTop: 8
              }}>
                <div style={{ fontSize: 13, color: "#D32F2F", fontFamily: "'DM Mono', monospace", marginBottom: 6, fontWeight: 700 }}>
                  The lender keeps
                </div>
                <div style={{ fontSize: 32, color: "#D32F2F", fontWeight: 700 }}>
                  <AnimatedNumber target={totalInterest} duration={2000} />
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#D32F2F", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                  That is {Math.round(percentInterest)}% of everything you pay.
                  {annualRate > 0 && ` Effective rate: ${annualRate.toFixed(0)}% per year.`}
                </div>
              </div>

              {monthsPaid > 0 && (
                <div style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  background: "#f4f8ff",
                  borderRadius: 8,
                  border: "1.5px solid #90CAF9"
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1565C0", marginBottom: 6, fontWeight: 700 }}>
                    After {monthsPaid} months of paying {fmt(payment)}/month
                  </div>
                  <div style={{ fontSize: 15, color: "#1a1a2e", fontWeight: 700 }}>
                    You've paid <span style={{ color: "#1565C0" }}>{fmt(payment * monthsPaid)}</span> total.
                    You still owe <span style={{ color: "#D32F2F" }}>{fmt(remaining)}</span>.
                  </div>
                </div>
              )}

              {salary > 0 && (
                <div style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  background: "#fff5f5",
                  borderRadius: 8,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  color: "#1565C0",
                  lineHeight: 1.6,
                  fontWeight: 700,
                }}>
                  This loan costs you{" "}
                  <span style={{ color: "#D32F2F" }}>
                    {Math.round((payment / salary) * 100)}% of your salary
                  </span>{" "}
                  every single month for {months - monthsPaid} more months.
                </div>
              )}
            </div>

            {/* ── SECTION 2: What It Could Have Been ── */}
            <div style={S.card}>
              <div style={S.sectionLabel}>What {fmt(totalInterest)} could have been</div>
              <div style={{ fontSize: 14, color: "#1565C0", fontFamily: "'DM Mono', monospace", marginBottom: 16, lineHeight: 1.6, fontWeight: 700 }}>
                The interest alone — the money that buys you nothing — could have paid for:
              </div>

              {ALTERNATIVES.map((alt, i) => {
                const units = alt.isYear
                  ? (totalInterest / (alt.unit * 12)).toFixed(1)
                  : Math.floor(totalInterest / alt.unit);
                return (
                  <div key={i} style={S.altRow}>
                    <span style={{ fontSize: 28 }}>{alt.emoji}</span>
                    <div>
                      <div style={{ fontSize: 22, color: "#1565C0", fontWeight: 700 }}>
                        {units} {alt.isYear ? "years" : "months"}
                      </div>
                      <div style={{ fontSize: 12, color: "#1976D2", fontFamily: "'DM Mono', monospace", marginTop: 2, fontWeight: 700 }}>
                        of {alt.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── SECTION 3: The Spiral ── */}
            <div style={S.card}>
              <div style={S.sectionLabel}>Where you are heading</div>
              <div style={{ fontSize: 14, color: "#1565C0", fontFamily: "'DM Mono', monospace", marginBottom: 8, lineHeight: 1.6, fontWeight: 700 }}>
                This is what happens when you take a second loan halfway through your first — the pattern most people follow.
              </div>

              <div style={{ fontSize: 13, color: "#D32F2F", fontFamily: "'DM Mono', monospace", marginBottom: 20, lineHeight: 1.6, fontWeight: 700 }}>
                The red line is your future if you borrow again. Most people do.
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={spiralData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="singleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1565C0" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spiralGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#BBDEFB" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    stroke="#90CAF9"
                    tick={{ fill: "#1565C0", fontSize: 10, fontFamily: "DM Mono", fontWeight: 700 }}
                    label={{ value: "Month", position: "insideBottom", offset: -2, fill: "#1565C0", fontSize: 10 }}
                  />
                  <YAxis
                    stroke="#90CAF9"
                    tick={{ fill: "#1565C0", fontSize: 10, fontFamily: "DM Mono", fontWeight: 700 }}
                    tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="single"
                    stroke="#1565C0"
                    strokeWidth={2.5}
                    fill="url(#singleGrad)"
                    name="Debt (one loan)"
                    connectNulls={false}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="spiral"
                    stroke="#D32F2F"
                    strokeWidth={2.5}
                    fill="url(#spiralGrad)"
                    name="Debt (spiral)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#1565C0", fontWeight: 700 }}>
                  <div style={{ width: 20, height: 2, background: "#1565C0" }} />
                  If you stop here
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#D32F2F", fontWeight: 700 }}>
                  <div style={{ width: 20, height: 2, background: "#D32F2F" }} />
                  If you borrow again
                </div>
              </div>
            </div>

            {/* ── SECTION 4: Exit Path ── */}
            <div style={S.exitCard}>
              <div style={{ ...S.sectionLabel, color: "#1565C0" }}>Your first step out</div>
              <div style={{ fontSize: 22, lineHeight: 1.4, marginBottom: 16, color: "#1a1a2e", fontWeight: 700 }}>
                You cannot fix this overnight. But you can stop it from getting worse today.
              </div>

              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.8, color: "#1565C0", fontWeight: 700 }}>
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #90CAF9" }}>
                  <span style={{ color: "#1565C0" }}>01 —</span> Do not take another loan to pay this one. That is how the spiral starts.
                </div>
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #90CAF9" }}>
                  <span style={{ color: "#1565C0" }}>02 —</span> Contact the National Credit Regulator (NCR) if your lender is charging more than 5% per month: <span style={{ color: "#D32F2F" }}>0860 627 627</span>
                </div>
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #90CAF9" }}>
                  <span style={{ color: "#1565C0" }}>03 —</span> Ask your employer's HR department about garnishee order audits. Many are illegal.
                </div>
                <div>
                  <span style={{ color: "#1565C0" }}>04 —</span> DebtBusters or National Debt Advisors offer free debt counselling: <span style={{ color: "#D32F2F" }}>0861 663 328</span>
                </div>
              </div>

              <div style={{
                marginTop: 24,
                padding: "16px",
                background: "rgba(21, 101, 192, 0.07)",
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "'DM Mono', monospace",
                color: "#1565C0",
                lineHeight: 1.7,
                fontWeight: 700,
              }}>
                The lender is not your enemy. But this arrangement is designed so that you lose. Now you can see exactly how.
              </div>
            </div>

            {/* ── DISCLAIMER (Results Page) ── */}
            <div style={{
              marginTop: 24,
              padding: "14px 16px",
              background: "#fff5f5",
              border: "2px solid #D32F2F",
              borderRadius: 8,
              textAlign: "center",
            }}>
              <p style={{
                margin: 0,
                fontSize: 12,
                color: "#D32F2F",
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
                letterSpacing: "0.04em",
                lineHeight: 1.7,
              }}>
                ⚠️ DISCLAIMER: This tool is for educational and awareness purposes only. It does not constitute financial, legal, or credit advice. Always consult a registered financial adviser or debt counsellor before making any financial decisions. Your data is never stored or transmitted.
              </p>
            </div>

            <button
              style={{ ...S.btn, marginTop: 24 }}
              onClick={() => { setStep("input"); setForm({ principal: "", payment: "", months: "", salary: "", monthsPaid: "" }); setResult(null); }}
            >
              Calculate Another Loan
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}
