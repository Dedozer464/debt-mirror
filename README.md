
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Debt Mirror · South Africa</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --blue:       #1565C0;
      --blue-light: #1976D2;
      --blue-pale:  #e3f0ff;
      --blue-card:  #f4f8ff;
      --blue-border:#90CAF9;
      --blue-grid:  #BBDEFB;
      --red:        #D32F2F;
      --red-pale:   #fff5f5;
      --ink:        #1a1a2e;
      --white:      #ffffff;
      --serif:      'DM Serif Display', Georgia, serif;
      --mono:       'DM Mono', monospace;
    }

    body {
      background: var(--white);
      color: var(--ink);
      font-family: var(--serif);
      min-height: 100vh;
      padding-bottom: 80px;
    }

    /* ── HEADER ── */
    .header {
      border-bottom: 2px solid var(--blue);
      padding: 28px 24px 24px;
      background: linear-gradient(180deg, var(--blue-pale) 0%, var(--white) 100%);
    }
    .logo {
      font-size: 11px;
      letter-spacing: .3em;
      color: var(--blue);
      text-transform: uppercase;
      font-family: var(--mono);
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header h1 {
      font-size: clamp(26px, 5vw, 40px);
      font-weight: 700;
      line-height: 1.15;
      color: var(--blue);
    }
    .header p {
      margin-top: 8px;
      font-size: 14px;
      color: var(--blue-light);
      font-family: var(--mono);
      font-weight: 700;
      letter-spacing: .02em;
    }

    /* ── LAYOUT ── */
    .body-wrap { padding: 24px 16px 0; max-width: 600px; margin: 0 auto; }

    /* ── CARDS ── */
    .card {
      background: var(--blue-card);
      border: 1.5px solid var(--blue-border);
      border-radius: 12px;
      padding: 28px 24px;
      margin-bottom: 16px;
    }
    .exit-card {
      background: linear-gradient(135deg, #e3f2fd 0%, var(--blue-card) 100%);
      border: 1.5px solid var(--blue);
      border-radius: 12px;
      padding: 28px 24px;
      margin-bottom: 16px;
    }

    /* ── LABELS ── */
    .field-label {
      display: block;
      font-size: 11px;
      letter-spacing: .2em;
      color: var(--blue);
      text-transform: uppercase;
      font-family: var(--mono);
      font-weight: 700;
      margin-bottom: 8px;
    }
    .section-label {
      font-size: 10px;
      letter-spacing: .3em;
      color: var(--blue);
      text-transform: uppercase;
      font-family: var(--mono);
      font-weight: 700;
      margin-bottom: 12px;
    }

    /* ── INPUTS ── */
    .field { margin-bottom: 24px; }
    input[type=number] {
      width: 100%;
      background: var(--white);
      border: 1.5px solid var(--blue-border);
      border-radius: 8px;
      padding: 14px 16px;
      color: var(--ink);
      font-size: 20px;
      font-family: var(--mono);
      font-weight: 700;
      outline: none;
      transition: border-color .2s;
      -moz-appearance: textfield;
    }
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
    input[type=number]:focus { border-color: var(--blue); }

    hr.divider {
      border: none;
      border-top: 1.5px solid var(--blue-border);
      margin: 20px 0;
    }

    /* ── BUTTONS ── */
    .btn-primary {
      width: 100%;
      background: var(--blue);
      color: var(--white);
      border: none;
      border-radius: 8px;
      padding: 18px;
      font-size: 16px;
      font-family: var(--serif);
      font-weight: 700;
      cursor: pointer;
      letter-spacing: .05em;
      margin-top: 8px;
      transition: background .2s, transform .1s;
    }
    .btn-primary:hover { background: #0d47a1; }
    .btn-primary:active { transform: scale(.98); }

    .btn-back {
      background: transparent;
      border: 1.5px solid var(--blue);
      border-radius: 8px;
      color: var(--blue);
      padding: 10px 20px;
      font-family: var(--mono);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 20px;
      letter-spacing: .1em;
      transition: background .2s;
    }
    .btn-back:hover { background: var(--blue-pale); }

    .btn-reset {
      width: 100%;
      background: var(--white);
      color: var(--blue);
      border: 1.5px solid var(--blue);
      border-radius: 8px;
      padding: 18px;
      font-size: 16px;
      font-family: var(--serif);
      font-weight: 700;
      cursor: pointer;
      letter-spacing: .05em;
      margin-top: 24px;
      transition: background .2s;
    }
    .btn-reset:hover { background: var(--blue-pale); }

    /* ── ERROR ── */
    .error-box {
      background: var(--red-pale);
      border: 1.5px solid var(--red);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--red);
      font-size: 13px;
      font-family: var(--mono);
      font-weight: 700;
      margin-bottom: 16px;
      display: none;
    }

    /* ── DISCLAIMER ── */
    .disclaimer {
      text-align: center;
      margin-top: 16px;
      font-size: 12px;
      color: var(--red);
      font-family: var(--mono);
      font-weight: 700;
      letter-spacing: .05em;
      line-height: 1.6;
    }
    .disclaimer-box {
      margin-top: 24px;
      padding: 14px 16px;
      background: var(--red-pale);
      border: 2px solid var(--red);
      border-radius: 8px;
      text-align: center;
    }
    .disclaimer-box p {
      margin: 0;
      font-size: 12px;
      color: var(--red);
      font-family: var(--mono);
      font-weight: 700;
      letter-spacing: .04em;
      line-height: 1.7;
    }

    /* ── RESULT NUMBERS ── */
    .big-num {
      font-size: clamp(34px, 8vw, 58px);
      font-weight: 700;
      line-height: 1;
      letter-spacing: -.02em;
    }
    .num-blue  { color: var(--blue); }
    .num-red   { color: var(--red); }
    .num-green { color: #2a9d8f; }

    .sub-label {
      font-size: 13px;
      color: var(--blue);
      font-family: var(--mono);
      font-weight: 700;
      margin-bottom: 4px;
    }
    .num-block { margin-bottom: 20px; }

    /* ── INTEREST BOX ── */
    .interest-box {
      background: var(--red-pale);
      border: 1.5px solid var(--red);
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }
    .interest-box .int-label {
      font-size: 13px;
      color: var(--red);
      font-family: var(--mono);
      font-weight: 700;
      margin-bottom: 6px;
    }
    .interest-box .int-num {
      font-size: 32px;
      color: var(--red);
      font-weight: 700;
    }
    .interest-box .int-sub {
      margin-top: 8px;
      font-size: 13px;
      color: var(--red);
      font-family: var(--mono);
      font-weight: 700;
    }

    /* ── PAID SO FAR BOX ── */
    .paid-box {
      margin-top: 16px;
      padding: 14px 16px;
      background: var(--blue-card);
      border-radius: 8px;
      border: 1.5px solid var(--blue-border);
    }
    .paid-box .paid-meta {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--blue);
      font-weight: 700;
      margin-bottom: 6px;
    }
    .paid-box .paid-body {
      font-size: 15px;
      color: var(--ink);
      font-weight: 700;
    }

    /* ── SALARY BOX ── */
    .salary-box {
      margin-top: 16px;
      padding: 14px 16px;
      background: var(--red-pale);
      border-radius: 8px;
      font-family: var(--mono);
      font-size: 13px;
      color: var(--blue);
      font-weight: 700;
      line-height: 1.6;
    }

    /* ── ALT ROWS ── */
    .alt-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid var(--blue-grid);
    }
    .alt-row:last-child { border-bottom: none; }
    .alt-emoji { font-size: 28px; }
    .alt-units { font-size: 22px; color: var(--blue); font-weight: 700; }
    .alt-label { font-size: 12px; color: var(--blue-light); font-family: var(--mono); font-weight: 700; margin-top: 2px; }

    /* ── CHART ── */
    .chart-wrap { width: 100%; margin: 8px 0 0; position: relative; }
    canvas#spiralChart { width: 100% !important; height: 220px !important; }

    .chart-legend {
      display: flex;
      gap: 20px;
      margin-top: 14px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-family: var(--mono);
      font-weight: 700;
    }
    .legend-line {
      width: 20px;
      height: 2.5px;
      border-radius: 2px;
    }

    /* ── EXIT PATH ── */
    .exit-steps {
      font-family: var(--mono);
      font-size: 13px;
      line-height: 1.8;
      color: var(--blue);
      font-weight: 700;
    }
    .exit-step {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--blue-border);
    }
    .exit-step:last-child { border-bottom: none; margin-bottom: 0; }
    .exit-num { color: var(--blue); }
    .exit-phone { color: var(--red); }

    .exit-footer {
      margin-top: 24px;
      padding: 16px;
      background: rgba(21,101,192,.07);
      border-radius: 8px;
      font-size: 13px;
      font-family: var(--mono);
      color: var(--blue);
      line-height: 1.7;
      font-weight: 700;
    }

    /* ── SCREENS ── */
    #screen-input  { display: block; }
    #screen-result { display: none; }

    /* ── PRIVACY NOTE ── */
    .privacy-note {
      text-align: center;
      margin-top: 16px;
      font-size: 11px;
      color: var(--blue-light);
      font-family: var(--mono);
      font-weight: 700;
      letter-spacing: .05em;
    }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════
     INPUT SCREEN
════════════════════════════════════════════════════════ -->
<div id="screen-input">
  <div class="header">
    <div class="logo">Debt Mirror · South Africa</div>
    <h1>See what your<br>loan is really costing you.</h1>
    <p>No judgement. Just the truth.</p>
  </div>

  <div class="body-wrap">
    <div class="card">
      <div class="field">
        <label class="field-label" for="principal">How much did you borrow? *</label>
        <input type="number" id="principal" placeholder="5000" min="1" />
      </div>

      <div class="field">
        <label class="field-label" for="payment">What do you pay back every month? *</label>
        <input type="number" id="payment" placeholder="900" min="1" />
      </div>

      <div class="field">
        <label class="field-label" for="months">Total number of months to repay *</label>
        <input type="number" id="months" placeholder="18" min="1" />
      </div>

      <hr class="divider" />

      <div class="field">
        <label class="field-label" for="monthsPaid">How many months have you already paid? (optional)</label>
        <input type="number" id="monthsPaid" placeholder="0" min="0" />
      </div>

      <div class="field" style="margin-bottom:0">
        <label class="field-label" for="salary">Your monthly salary (optional — for context)</label>
        <input type="number" id="salary" placeholder="12000" min="0" />
      </div>
    </div>

    <div id="error-box" class="error-box"></div>

    <button class="btn-primary" onclick="calculate()">Show Me The Truth →</button>

    <p class="disclaimer">
      ⚠️ DISCLAIMER: Your information stays on this device.<br>
      Nothing is stored or shared. This tool is for educational purposes only<br>
      and does not constitute financial advice.
    </p>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     RESULTS SCREEN
════════════════════════════════════════════════════════ -->
<div id="screen-result">
  <div class="header">
    <div class="logo">Debt Mirror · Your Results</div>
    <h1>Here is where<br>you actually stand.</h1>
  </div>

  <div class="body-wrap">
    <button class="btn-back" onclick="goBack()">← Recalculate</button>

    <!-- SECTION 1: True Cost -->
    <div class="card">
      <div class="section-label">What this loan actually costs you</div>

      <div class="num-block">
        <div class="sub-label">You borrowed</div>
        <div class="big-num num-blue" id="r-principal">R0</div>
      </div>

      <div class="num-block">
        <div class="sub-label">You will pay back</div>
        <div class="big-num num-red" id="r-total">R0</div>
      </div>

      <div class="interest-box">
        <div class="int-label">The lender keeps</div>
        <div class="int-num" id="r-interest">R0</div>
        <div class="int-sub" id="r-interest-sub"></div>
      </div>

      <div class="paid-box" id="r-paid-box" style="display:none">
        <div class="paid-meta" id="r-paid-meta"></div>
        <div class="paid-body" id="r-paid-body"></div>
      </div>

      <div class="salary-box" id="r-salary-box" style="display:none" id="r-salary-label"></div>
    </div>

    <!-- SECTION 2: Alternatives -->
    <div class="card">
      <div class="section-label" id="r-alt-title">What your interest could have been</div>
      <div style="font-size:14px;color:var(--blue);font-family:var(--mono);font-weight:700;margin-bottom:16px;line-height:1.6">
        The interest alone — the money that buys you nothing — could have paid for:
      </div>
      <div id="r-alternatives"></div>
    </div>

    <!-- SECTION 3: Spiral Chart -->
    <div class="card">
      <div class="section-label">Where you are heading</div>
      <div style="font-size:14px;color:var(--blue);font-family:var(--mono);font-weight:700;margin-bottom:8px;line-height:1.6">
        This is what happens when you take a second loan halfway through your first — the pattern most people follow.
      </div>
      <div style="font-size:13px;color:var(--red);font-family:var(--mono);font-weight:700;margin-bottom:16px;line-height:1.6">
        The red line is your future if you borrow again. Most people do.
      </div>
      <div class="chart-wrap">
        <canvas id="spiralChart"></canvas>
      </div>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-line" style="background:var(--blue)"></div>
          <span style="color:var(--blue)">If you stop here</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="background:var(--red)"></div>
          <span style="color:var(--red)">If you borrow again</span>
        </div>
      </div>
    </div>

    <!-- SECTION 4: Exit Path -->
    <div class="exit-card">
      <div class="section-label">Your first step out</div>
      <div style="font-size:22px;line-height:1.4;margin-bottom:16px;color:var(--ink);font-weight:700">
        You cannot fix this overnight. But you can stop it from getting worse today.
      </div>
      <div class="exit-steps">
        <div class="exit-step">
          <span class="exit-num">01 —</span> Do not take another loan to pay this one. That is how the spiral starts.
        </div>
        <div class="exit-step">
          <span class="exit-num">02 —</span> Contact the National Credit Regulator (NCR) if your lender is charging more than 5% per month: <span class="exit-phone">0860 627 627</span>
        </div>
        <div class="exit-step">
          <span class="exit-num">03 —</span> Ask your employer's HR department about garnishee order audits. Many are illegal.
        </div>
        <div class="exit-step">
          <span class="exit-num">04 —</span> DebtBusters or National Debt Advisors offer free debt counselling: <span class="exit-phone">0861 663 328</span>
        </div>
      </div>
      <div class="exit-footer">
        The lender is not your enemy. But this arrangement is designed so that you lose. Now you can see exactly how.
      </div>
    </div>

    <!-- DISCLAIMER (Results) -->
    <div class="disclaimer-box">
      <p>⚠️ DISCLAIMER: This tool is for educational and awareness purposes only. It does not constitute financial, legal, or credit advice. Always consult a registered financial adviser or debt counsellor before making any financial decisions. Your data is never stored or transmitted.</p>
    </div>

    <button class="btn-reset" onclick="reset()">Calculate Another Loan</button>
  </div>
</div>

<script>
// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(v) {
  return "R" + Number(v).toLocaleString("en-ZA", { maximumFractionDigits: 0 });
}

function calcMonthlyRate(principal, payment, months) {
  if (payment * months <= principal) return 0;
  let r = 0.05;
  for (let i = 0; i < 200; i++) {
    const pow = Math.pow(1 + r, months);
    const f   = (principal * r * pow) / (pow - 1) - payment;
    const df  = principal * (pow * (1 + r * months) - pow + 1) / Math.pow(pow - 1, 2);
    if (!isFinite(f) || !isFinite(df) || df === 0) break;
    const next = r - f / df;
    if (Math.abs(next - r) < 0.000001) { r = next; break; }
    r = Math.max(0.001, next);
  }
  return r;
}

function buildSpiralData(principal, payment, months) {
  const rate = calcMonthlyRate(principal, payment, months);
  const mid  = Math.floor(months / 2);
  const data = [];
  let bal1 = principal, bal2 = 0, spiralStarted = false;

  for (let m = 1; m <= Math.ceil(months * 1.8); m++) {
    const int1 = bal1 * rate;
    bal1 = Math.max(0, bal1 - (payment - int1));
    if (m === mid) { bal2 = principal; spiralStarted = true; }
    if (spiralStarted && bal2 > 0) {
      const int2 = bal2 * rate;
      bal2 = Math.max(0, bal2 - (payment - int2));
    }
    data.push({
      month:  m,
      single: m <= months ? Math.round(bal1) : null,
      spiral: Math.round(bal1 + bal2),
    });
  }
  return { data, rate };
}

// ─── Animated Counter ───────────────────────────────────────────────────────

function animateNumber(el, target, duration, prefix) {
  prefix = prefix !== undefined ? prefix : "R";
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const val      = Math.round(ease * target);
    el.textContent = prefix + val.toLocaleString("en-ZA");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── Canvas Chart ──────────────────────────────────────────────────────────

function drawChart(spiralData) {
  const canvas = document.getElementById("spiralChart");
  const dpr    = window.devicePixelRatio || 1;
  const W      = canvas.parentElement.clientWidth;
  const H      = 220;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const PAD = { top: 14, right: 12, bottom: 34, left: 46 };
  const cW  = W - PAD.left - PAD.right;
  const cH  = H - PAD.top  - PAD.bottom;

  // ── find data range ──
  const allVals = spiralData.flatMap(d => [d.single ?? 0, d.spiral]);
  const maxY    = Math.max(...allVals) * 1.08;
  const n       = spiralData.length;

  function xPos(i)  { return PAD.left + (i / (n - 1)) * cW; }
  function yPos(v)  { return PAD.top  + cH - (v / maxY) * cH; }

  // ── grid lines ──
  ctx.strokeStyle = "#BBDEFB";
  ctx.lineWidth   = 1;
  const gridCount = 4;
  for (let g = 0; g <= gridCount; g++) {
    const y = PAD.top + (g / gridCount) * cH;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke();
    // y-axis labels
    const val = maxY * (1 - g / gridCount);
    ctx.fillStyle    = "#1565C0";
    ctx.font         = "bold 10px 'DM Mono', monospace";
    ctx.textAlign    = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("R" + (val >= 1000 ? (val / 1000).toFixed(0) + "k" : val.toFixed(0)), PAD.left - 4, y);
  }

  // x-axis ticks
  const xTickCount = Math.min(6, n - 1);
  ctx.fillStyle    = "#1565C0";
  ctx.font         = "bold 10px 'DM Mono', monospa
