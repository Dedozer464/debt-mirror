<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Debt Mirror v2 — NCR Loan Compliance Analyser</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px}
body{background:#0a0a0c;color:#e2e8f0;font-family:'Sora',sans-serif;min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#0a0a0c}
::-webkit-scrollbar-thumb{background:#1e1e28;border-radius:3px}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button{opacity:1}
select option{background:#141420;color:#e2e8f0}
input,select{font-family:'DM Mono',monospace}

/* ── LAYOUT ── */
#app{display:flex;flex-direction:column;min-height:100vh}
header{
  position:sticky;top:0;z-index:100;
  height:58px;padding:0 28px;
  background:rgba(10,10,14,.97);
  border-bottom:1px solid #1e1e28;
  display:flex;align-items:center;justify-content:space-between;
  backdrop-filter:blur(10px);
}
.logo{display:flex;align-items:center;gap:10px}
.logo-icon{
  width:30px;height:30px;border-radius:7px;
  background:linear-gradient(135deg,#dc2626,#7f1d1d);
  display:flex;align-items:center;justify-content:center;
  font-size:15px;flex-shrink:0;
}
.logo-text{
  font-size:15px;font-weight:700;letter-spacing:-.4px;
  background:linear-gradient(90deg,#f8fafc,#94a3b8);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.v-badge{
  background:#dc2626;color:#fff;font-size:9px;
  font-family:'DM Mono',monospace;letter-spacing:2px;
  padding:2px 6px;border-radius:3px;font-weight:700;
}
.header-right{display:flex;align-items:center;gap:14px}
.repo-label{font-size:11px;color:#475569;font-family:'DM Mono',monospace}
.repo-label span{color:#94a3b8}

.main-grid{
  max-width:1200px;margin:0 auto;padding:26px 22px;
  display:grid;grid-template-columns:350px 1fr;gap:22px;flex:1;
}
@media(max-width:900px){.main-grid{grid-template-columns:1fr}}

/* ── PANEL ── */
.panel{background:#0f0f14;border:1px solid #1e1e28;border-radius:12px;padding:22px}
.sec-label{
  font-size:10px;font-family:'DM Mono',monospace;
  color:#475569;letter-spacing:3px;font-weight:600;
  margin-bottom:14px;text-transform:uppercase;
}
.divider{border-top:1px solid #1e1e28;margin:18px 0}

/* ── FORM ── */
.field{margin-bottom:14px}
.field label{font-size:12px;color:#64748b;margin-bottom:5px;display:block}
.field input,.field select{
  width:100%;background:#141420;border:1px solid #1e1e28;
  border-radius:8px;padding:9px 13px;color:#e2e8f0;
  font-size:13px;outline:none;transition:border-color .18s;
  -webkit-appearance:none;appearance:none;
}
.field input:focus,.field select:focus{border-color:#3b3b50}

/* ── VERDICT BADGE ── */
.vbadge{
  display:inline-flex;align-items:center;gap:6px;
  border-radius:4px;padding:3px 10px;
  font-size:11px;font-family:'DM Mono',monospace;
  font-weight:700;letter-spacing:2px;
}
.vbadge-safe   {color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3)}
.vbadge-warn   {color:#f59e0b;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3)}
.vbadge-danger {color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3)}

/* ── NCR BAR ── */
.ncr-bar{background:#141420;border-radius:10px;padding:14px;border:1px solid #1e1e28;margin-bottom:18px}
.ncr-bar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:11px;font-family:'DM Mono',monospace}
.ncr-bar-track{height:7px;background:#1e1e28;border-radius:4px;overflow:hidden}
.ncr-bar-fill{height:100%;border-radius:4px;transition:width .6s cubic-bezier(.34,1.56,.64,1)}
.ncr-bar-footer{display:flex;justify-content:space-between;margin-top:5px;font-size:10px;font-family:'DM Mono',monospace;color:#334155}

/* ── ANALYSE BUTTON ── */
.analyse-btn{
  width:100%;padding:13px;border-radius:10px;border:none;
  background:linear-gradient(135deg,#dc2626,#b91c1c);
  color:#fff;font-size:14px;font-weight:700;
  cursor:pointer;letter-spacing:.4px;
  box-shadow:0 4px 20px rgba(220,38,38,.3);
  transition:box-shadow .2s,transform .1s;
  font-family:'Sora',sans-serif;
}
.analyse-btn:hover{box-shadow:0 4px 30px rgba(220,38,38,.55)}
.analyse-btn:active{transform:scale(.98)}

/* ── STAT GRID ── */
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:20px}
.stat-box{background:#0f0f14;border:1px solid #1e1e28;border-radius:10px;padding:15px}
.stat-box.danger{background:rgba(220,38,38,.05);border-color:rgba(220,38,38,.3)}
.stat-box .stat-label{font-size:10px;color:#475569;font-family:'DM Mono',monospace;letter-spacing:2px;margin-bottom:5px}
.stat-box .stat-val{font-size:20px;font-weight:700;font-family:'DM Mono',monospace;color:#f8fafc}
.stat-box.danger .stat-val{color:#ef4444}

/* ── VIOLATION BANNER ── */
.violation-banner{
  background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.3);
  border-radius:10px;padding:13px 17px;margin-bottom:18px;
  display:flex;align-items:center;gap:12px;
}
.violation-banner .vb-title{font-weight:700;color:#ef4444;font-size:13px}
.violation-banner .vb-text{font-size:12px;color:#94a3b8;margin-top:3px}

/* ── TABS ── */
.tabs{
  display:flex;gap:4px;margin-bottom:18px;
  background:#0f0f14;border-radius:10px;padding:4px;
  border:1px solid #1e1e28;
}
.tab-btn{
  flex:1;padding:8px 10px;border-radius:8px;border:none;
  background:transparent;color:#475569;
  font-size:12px;font-weight:600;cursor:pointer;
  font-family:'Sora',sans-serif;transition:all .17s;letter-spacing:.3px;
}
.tab-btn.active{background:#1e1e28;color:#f8fafc}

/* ── METRICS GRID ── */
.metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-top:18px}
.metric-box{background:#141420;border-radius:8px;padding:13px;border:1px solid #1e1e28}
.metric-box .m-label{font-size:10px;color:#475569;font-family:'DM Mono',monospace;letter-spacing:1.5px;margin-bottom:5px}
.metric-box .m-val{font-size:13px;font-weight:700;font-family:'DM Mono',monospace;color:#94a3b8}
.metric-box .m-val.warn{color:#ef4444}

/* ── CHART LEGEND ── */
.chart-legend{display:flex;gap:20px;margin-bottom:10px}
.legend-item{display:flex;align-items:center;gap:6px;font-size:11px;font-family:'DM Mono',monospace;color:#64748b}
.legend-dot{width:10px;height:3px;border-radius:2px}

/* ── SCHEDULE TABLE ── */
.sched-wrap{overflow-y:auto;max-height:440px;border-radius:8px;border:1px solid #1e1e28}
.sched-table{width:100%;border-collapse:collapse;font-size:12px;font-family:'DM Mono',monospace}
.sched-table th{
  padding:9px 13px;text-align:right;background:#141420;color:#475569;
  font-size:10px;letter-spacing:2px;position:sticky;top:0;
  border-bottom:1px solid #1e1e28;font-weight:600;
}
.sched-table td{padding:7px 13px;text-align:right}
.sched-table tr:nth-child(even){background:#0f0f14}
.sched-table tr:nth-child(odd){background:transparent}

/* ── BREAKDOWN BARS ── */
.bk-row{margin-bottom:13px}
.bk-header{display:flex;justify-content:space-between;margin-bottom:4px}
.bk-lbl{font-size:11px;color:#64748b}
.bk-val{font-size:12px;font-family:'DM Mono',monospace}
.bk-track{height:4px;background:#1e1e28;border-radius:2px}
.bk-fill{height:100%;border-radius:2px;transition:width .8s ease}
.bk-total{border-top:1px solid #1e1e28;padding-top:11px;margin-top:4px;display:flex;justify-content:space-between}

/* ── AI PANEL ── */
.ai-empty{text-align:center;padding:52px 24px;color:#334155}
.ai-empty .ai-icon{font-size:42px;opacity:.3;margin-bottom:14px}
.ai-loading{text-align:center;padding:52px 24px}
.spinner{font-size:34px;color:#dc2626;display:inline-block;margin-bottom:14px}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.spinner.running{animation:spin 1.2s linear infinite}
.ai-error{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.25);border-radius:10px;padding:18px;color:#ef4444;font-size:13px}
.ai-summary{background:#141420;border-radius:10px;padding:15px;margin-bottom:15px;border:1px solid #1e1e28;font-size:13px;color:#94a3b8;line-height:1.7}
.ai-cols{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.ai-col{border-radius:10px;padding:15px}
.ai-col.flags{background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.15)}
.ai-col.advice{background:rgba(34,197,94,.04);border:1px solid rgba(34,197,94,.15)}
.ai-col-title{font-size:10px;font-family:'DM Mono',monospace;letter-spacing:2px;margin-bottom:11px}
.ai-col.flags .ai-col-title{color:#ef4444}
.ai-col.advice .ai-col-title{color:#22c55e}
.ai-item{display:flex;gap:9px;margin-bottom:9px;font-size:12px;color:#94a3b8;line-height:1.5}
.ai-item .bullet-flag{color:#ef4444;flex-shrink:0}
.ai-item .bullet-adv{color:#22c55e;flex-shrink:0}
.ai-footer{margin-top:14px;background:#141420;border-radius:10px;padding:11px;border:1px solid #1e1e28;font-size:10px;color:#334155;font-family:'DM Mono',monospace;line-height:1.8}
.ai-footer .over-cap{color:#ef4444;margin-left:10px}
.ai-verdict-row{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.hcs-box{display:flex;align-items:center;gap:7px;background:#141420;border-radius:8px;padding:5px 12px;border:1px solid #1e1e28}
.hcs-label{font-size:10px;color:#475569;font-family:'DM Mono',monospace;letter-spacing:1px}
.hcs-val{font-size:13px;font-weight:700;font-family:'DM Mono',monospace}

/* ── DISCLAIMER ── */
.disclaimer{margin-top:11px;padding:11px 15px;background:#0f0f14;border:1px solid #1e1e28;border-radius:10px;font-size:11px;color:#334155;line-height:1.6}
.disclaimer a{color:#475569}

/* ── FADE IN ── */
@keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
.fade{animation:fadeIn .3s ease both}
</style>
</head>
<body>
<div id="app">

  <!-- HEADER -->
  <header>
    <div class="logo">
      <div class="logo-icon">◈</div>
      <span class="logo-text">Debt Mirror</span>
      <span class="v-badge">v2</span>
    </div>
    <div class="header-right">
      <span class="repo-label">SARB Repo: <span id="hdr-repo">8.25</span>%</span>
      <span id="hdr-verdict" class="vbadge vbadge-safe">✓ COMPLIANT</span>
    </div>
  </header>

  <!-- MAIN GRID -->
  <div class="main-grid">

    <!-- LEFT: CONFIG -->
    <aside>
      <div class="panel">
        <div class="sec-label">Loan Configuration</div>

        <div class="field">
          <label>Loan Type</label>
          <select id="loanType">
            <option value="mortgage">Mortgage Agreement</option>
            <option value="unsecured" selected>Unsecured Credit</option>
            <option value="facility">Credit Facility</option>
            <option value="shortterm">Short-term Credit (≤6 mths)</option>
            <option value="developmental">Developmental Credit</option>
            <option value="other">Other Credit Agreement</option>
          </select>
        </div>
        <div class="field"><label>Principal Amount (R)</label><input type="number" id="principal" value="50000" min="500" step="500"/></div>
        <div class="field"><label>Stated APR (%)</label><input type="number" id="statedAPR" value="29.5" min="0.1" step="0.1"/></div>
        <div class="field"><label>Term (months)</label><input type="number" id="months" value="60" min="1" max="360" step="1"/></div>

        <div class="divider"></div>
        <div class="sec-label">Fees &amp; Settings</div>

        <div class="field"><label>Initiation Fee (R)</label><input type="number" id="initFee" value="1207.50" step="0.5"/></div>
        <div class="field"><label>Monthly Service Fee (R)</label><input type="number" id="monthlyFee" value="69" step="1"/></div>
        <div class="field"><label>Monthly Insurance (R)</label><input type="number" id="insurance" value="150" step="1"/></div>
        <div class="field"><label>SARB Repo Rate (%)</label><input type="number" id="repoRate" value="8.25" step="0.25"/></div>

        <div class="divider"></div>

        <!-- NCR BAR -->
        <div class="ncr-bar">
          <div class="ncr-bar-header">
            <span style="color:#475569;letter-spacing:2px">NCR MAX CAP</span>
            <span id="ncr-cap-label" style="color:#22c55e;font-weight:600">29.25%</span>
          </div>
          <div class="ncr-bar-track">
            <div class="ncr-bar-fill" id="ncr-bar-fill" style="width:0%;background:linear-gradient(90deg,#22c55e,#22c55e)"></div>
          </div>
          <div class="ncr-bar-footer">
            <span>0%</span>
            <span id="ncr-eff-label" style="color:#22c55e">Effective: —</span>
          </div>
        </div>

        <button class="analyse-btn" onclick="runAI()">◈ Run AI Compliance Analysis</button>
      </div>

      <div class="disclaimer">
        Newton-Raphson IRR inclusive of all fees. NCR caps per NCA s.100–106.
        Not legal advice. Report violations: <a href="https://www.ncr.org.za" target="_blank">ncr.org.za</a>
      </div>
    </aside>

    <!-- RIGHT: RESULTS -->
    <main>
      <!-- STAT GRID -->
      <div class="stat-grid">
        <div class="stat-box" id="stat-monthly">
          <div class="stat-label">MONTHLY TOTAL</div>
          <div class="stat-val" id="val-monthly">R 0.00</div>
        </div>
        <div class="stat-box" id="stat-eff">
          <div class="stat-label">EFFECTIVE APR</div>
          <div class="stat-val" id="val-eff">0.00%</div>
        </div>
        <div class="stat-box" id="stat-total">
          <div class="stat-label">TOTAL REPAID</div>
          <div class="stat-val" id="val-total">R 0.00</div>
        </div>
        <div class="stat-box" id="stat-interest">
          <div class="stat-label">TOTAL INTEREST</div>
          <div class="stat-val" id="val-interest">R 0.00</div>
        </div>
      </div>

      <!-- VIOLATION BANNER -->
      <div class="violation-banner" id="violation-banner" style="display:none">
        <span style="font-size:22px">⚠</span>
        <div>
          <div class="vb-title">NCR Rate Cap Violated</div>
          <div class="vb-text" id="violation-text"></div>
        </div>
      </div>

      <!-- TABS -->
      <div class="tabs">
        <button class="tab-btn active" onclick="switchTab('overview',this)">Overview</button>
        <button class="tab-btn" onclick="switchTab('schedule',this)">Amortisation</button>
        <button class="tab-btn" onclick="switchTab('breakdown',this)">Cost Breakdown</button>
        <button class="tab-btn" onclick="switchTab('ai',this)">AI Analysis</button>
      </div>

      <!-- TAB: OVERVIEW -->
      <div id="tab-overview" class="panel fade">
        <div class="sec-label">Balance vs Cumulative Interest</div>
        <div class="chart-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#3b82f6"></div>Remaining Balance</div>
          <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div>Cumulative Interest</div>
        </div>
        <svg id="area-chart" width="100%" height="220" style="overflow:visible"></svg>
        <div class="divider"></div>
        <div class="sec-label">Key Metrics</div>
        <div class="metrics-grid">
          <div class="metric-box"><div class="m-label">INTEREST-TO-PRINCIPAL</div><div class="m-val warn" id="m-itp">0%</div></div>
          <div class="metric-box"><div class="m-label">MONTHLY BASE PAYMENT</div><div class="m-val" id="m-base">R 0.00</div></div>
          <div class="metric-box"><div class="m-label">TOTAL FEES (LIFETIME)</div><div class="m-val" id="m-fees">R 0.00</div></div>
          <div class="metric-box"><div class="m-label">EFFECTIVE VS STATED</div><div class="m-val warn" id="m-delta">+0.00%</div></div>
          <div class="metric-box"><div class="m-label">NCR CAP</div><div class="m-val" id="m-cap">0.00%</div></div>
          <div class="metric-box"><div class="m-label">COMPLIANCE</div><div class="m-val" id="m-comp">COMPLIANT</div></div>
        </div>
      </div>

      <!-- TAB: SCHEDULE -->
      <div id="tab-schedule" class="panel fade" style="display:none">
        <div class="sec-label">Full Amortisation Schedule</div>
        <div class="sched-wrap">
          <table class="sched-table">
            <thead>
              <tr>
                <th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th>
              </tr>
            </thead>
            <tbody id="sched-body"></tbody>
          </table>
        </div>
      </div>

      <!-- TAB: BREAKDOWN -->
      <div id="tab-breakdown" class="panel fade" style="display:none">
        <div class="sec-label">Total Cost Decomposition</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center">
          <div>
            <svg id="pie-chart" width="100%" viewBox="0 0 220 220" style="max-height:220px"></svg>
            <div id="pie-legend" style="display:flex;flex-direction:column;gap:6px;margin-top:10px"></div>
          </div>
          <div id="bk-bars"></div>
        </div>
      </div>

      <!-- TAB: AI -->
      <div id="tab-ai" class="panel fade" style="display:none">
        <div class="sec-label">AI Compliance Analysis</div>
        <div id="ai-content">
          <div class="ai-empty">
            <div class="ai-icon">◈</div>
            <div style="font-size:14px;color:#475569;margin-bottom:6px">No analysis yet</div>
            <div style="font-size:12px">Click "Run AI Compliance Analysis" in the sidebar</div>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>

<script>
// ── NCR CAPS ──────────────────────────────────────────────────────────────────
const NCR_CAPS = {
  mortgage:      {label:'Mortgage Agreement',         addOn:21.0,  flat:null},
  unsecured:     {label:'Unsecured Credit',           addOn:21.0,  flat:null},
  facility:      {label:'Credit Facility',            addOn:14.0,  flat:null},
  shortterm:     {label:'Short-term Credit (≤6 mths)',addOn:null,  flat:5.0 },
  developmental: {label:'Developmental Credit',       addOn:27.0,  flat:null},
  other:         {label:'Other Credit Agreement',     addOn:17.0,  flat:null},
};

// ── NEWTON-RAPHSON IRR ────────────────────────────────────────────────────────
function solveIRR(principal, monthlyPayment, months) {
  if (monthlyPayment<=0||months<=0||principal<=0) return null;
  let r=0.01;
  for (let i=0;i<1000;i++) {
    const pv  = monthlyPayment*(1-Math.pow(1+r,-months))/r;
    const f   = pv-principal;
    const dpv = monthlyPayment*((-months*Math.pow(1+r,-months-1)*r-(1-Math.pow(1+r,-months)))/(r*r));
    const rn  = r - f/dpv;
    if (Math.abs(rn-r)<1e-10) return rn*12*100;
    r = rn<=0 ? 0.0001 : rn;
  }
  return r*12*100;
}

// ── AMORTISATION ──────────────────────────────────────────────────────────────
function buildSchedule(principal, monthlyRate, months, pmt) {
  const s=[]; let bal=principal, cumInt=0;
  for (let m=1;m<=months;m++) {
    const int  = bal*monthlyRate;
    const prin = Math.min(pmt-int, bal);
    bal = Math.max(0, bal-prin);
    cumInt += int;
    s.push({month:m, int:+int.toFixed(2), prin:+prin.toFixed(2), bal:+bal.toFixed(2), cumInt:+cumInt.toFixed(2)});
  }
  return s;
}

// ── FORMATTERS ────────────────────────────────────────────────────────────────
const fmt    = n => 'R\u00a0'+Number(n).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtPct = n => Number(n).toFixed(2)+'%';

// ── TAB SWITCHER ──────────────────────────────────────────────────────────────
function switchTab(id, btn) {
  ['overview','schedule','breakdown','ai'].forEach(t => {
    const el = document.getElementById('tab-'+t);
    if (el) el.style.display = t===id ? '' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('act
