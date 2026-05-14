<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Debt Mirror — See What Your Loan Is Really Costing You</title>
  <meta name="description" content="A free tool for South African government employees. See the true cost of your loan — in plain, honest language." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #09080500;
      --bg-solid: #090805;
      --surface:  #110e09;
      --surface2: #181308;
      --border:   #231a0c;
      --border2:  #2e2010;
      --text:     #ede8dd;
      --muted:    #7a6a50;
      --faint:    #3a2e1c;
      --accent:   #d4a039;
      --accent2:  #a87820;
      --danger:   #c0362a;
      --danger-bg:#1a0808;
      --safe:     #1a8a78;
      --safe-bg:  #071a16;
      --radius:   10px;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg-solid);
      color: var(--text);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── Grain overlay ── */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: 0.5;
    }

    /* ── Navigation ── */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(9,8,5,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -0.02em;
    }

    .nav-tag {
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--muted);
      text-transform: uppercase;
    }

    .nav-cta {
      background: var(--accent);
      color: var(--bg-solid);
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: 'Playfair Display', serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
      text-decoration: none;
    }
    .nav-cta:hover { background: var(--accent2); }

    /* ── Hero ── */
    .hero {
      position: relative;
      padding: 60px 20px 50px;
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }

    .hero::after {
      content: '';
      position: absolute;
      top: -100px;
      right: -100px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(192,54,42,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-eyebrow {
      font-size: 10px;
      letter-spacing: 0.35em;
      color: var(--danger);
      text-transform: uppercase;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .hero-eyebrow::before {
      content: '';
      display: inline-block;
      width: 24px;
      height: 1px;
      background: var(--danger);
    }

    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(32px, 7vw, 58px);
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
      max-width: 640px;
    }

    .hero h1 em {
      font-style: italic;
      color: var(--accent);
    }

    .hero-body {
      font-size: 14px;
      color: var(--muted);
      max-width: 480px;
      line-height: 1.8;
      margin-bottom: 32px;
    }

    .hero-stats {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      margin-top: 40px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
    }

    .stat-item { }
    .stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: var(--danger);
      font-weight: 700;
      display: block;
    }
    .stat-label {
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .scroll-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--muted);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      cursor: pointer;
      width: fit-content;
    }
    .scroll-arrow {
      width: 32px;
      height: 32px;
      border: 1px solid var(--border2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(4px); }
    }

    /* ── Section shared ── */
    .section {
      padding: 40px 20px;
      border-bottom: 1px solid var(--border);
      position: relative;
    }

    .section-label {
      font-size: 9px;
      letter-spacing: 0.35em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border2);
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(22px, 4vw, 32px);
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    /* ── Calculator ── */
    #calculator {
      background: var(--surface);
    }

    .form-grid {
      display: grid;
      gap: 20px;
      margin-top: 28px;
    }

    .form-group label {
      display: block;
      font-size: 9px;
      letter-spacing: 0.25em;
      color: var(--muted);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .form-group .hint {
      font-size: 10px;
      color: var(--faint);
      margin-top: 6px;
      letter-spacing: 0.05em;
    }

    .input-wrap {
      position: relative;
    }

    .input-prefix {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      font-size: 16px;
      pointer-events: none;
    }

    input[type="number"] {
      width: 100%;
      background: var(--bg-solid);
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      padding: 14px 14px 14px 36px;
      color: var(--text);
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      -moz-appearance: textfield;
    }
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
    input[type="number"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(212,160,57,0.1);
    }

    .divider-label {
      font-size: 9px;
      letter-spacing: 0.25em;
      color: var(--faint);
      text-transform: uppercase;
      text-align: center;
      padding: 8px 0;
      position: relative;
    }
    .divider-label::before, .divider-label::after {
      content: '';
      position: absolute;
      top: 50%;
      width: calc(50% - 60px);
      height: 1px;
      background: var(--border);
    }
    .divider-label::before { left: 0; }
    .divider-label::after { right: 0; }

    .error-box {
      background: var(--danger-bg);
      border: 1px solid var(--danger);
      border-radius: var(--radius);
      padding: 12px 16px;
      color: var(--danger);
      font-size: 12px;
      display: none;
      margin-top: 16px;
    }

    .submit-btn {
      width: 100%;
      background: var(--accent);
      color: var(--bg-solid);
      border: none;
      border-radius: var(--radius);
      padding: 18px;
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
      letter-spacing: 0.02em;
      transition: background 0.2s, transform 0.1s;
      position: relative;
      overflow: hidden;
    }
    .submit-btn:hover { background: #c49030; }
    .submit-btn:active { transform: scale(0.99); }

    .privacy-note {
      text-align: center;
      font-size: 10px;
      color: var(--faint);
      letter-spacing: 0.1em;
      margin-top: 16px;
    }

    /* ── Results ── */
    #results { display: none; }

    .reckoning-header {
      padding: 32px 20px;
      background: linear-gradient(180deg, #1a0505 0%, var(--bg-solid) 100%);
      border-bottom: 1px solid var(--border);
      text-align: center;
    }

    .reckoning-header h2 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(24px, 5vw, 40px);
      font-weight: 900;
      font-style: italic;
      color: var(--text);
      line-height: 1.2;
    }

    .reckoning-header p {
      color: var(--muted);
      font-size: 12px;
      margin-top: 8px;
      letter-spacing: 0.05em;
    }

    /* Cost cards */
    .cost-row {
      display: grid;
      gap: 12px;
      margin: 24px 0;
    }

    .cost-card {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      padding: 20px;
    }

    .cost-card.danger {
      background: var(--danger-bg);
      border-color: rgba(192,54,42,0.4);
    }

    .cost-card-label {
      font-size: 9px;
      letter-spacing: 0.25em;
      color: var(--muted);
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .cost-card-value {
      font-family: 'Playfair Display', serif;
      font-size: clamp(32px, 8vw, 52px);
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .cost-card-value.gold { color: var(--accent); }
    .cost-card-value.red { color: var(--danger); }
    .cost-card-value.white { color: var(--text); }

    .cost-card-sub {
      font-size: 11px;
      color: var(--muted);
      margin-top: 6px;
      line-height: 1.5;
    }

    .rate-badge {
      display: inline-block;
      background: rgba(192,54,42,0.15);
      border: 1px solid rgba(192,54,42,0.3);
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      color: var(--danger);
      margin-top: 10px;
      letter-spacing: 0.05em;
    }

    .salary-bar {
      margin-top: 16px;
      padding: 14px;
      background: var(--surface2);
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .bar-label {
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }

    .bar-track {
      height: 8px;
      background: var(--border2);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: var(--danger);
      border-radius: 4px;
      transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
    }

    .bar-value {
      font-size: 11px;
      color: var(--danger);
      margin-top: 6px;
    }

    /* Alternatives */
    .alt-list {
      display: grid;
      gap: 2px;
      margin-top: 20px;
    }

    .alt-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: border-color 0.2s;
    }
    .alt-item:hover { border-color: var(--safe); }

    .alt-emoji { font-size: 26px; flex-shrink: 0; }

    .alt-text { }
    .alt-qty {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      color: var(--safe);
      font-weight: 700;
    }
    .alt-desc {
      font-size: 11px;
      color: var(--muted);
      margin-top: 1px;
      letter-spacing: 0.03em;
    }

    /* Chart */
    .chart-container {
      position: relative;
      height: 240px;
      margin-top: 20px;
    }

    .chart-legend {
      display: flex;
      gap: 20px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 0.1em;
    }
    .legend-dot {
      width: 20px;
      height: 2px;
      border-radius: 2px;
    }

    .spiral-warning {
      margin-top: 16px;
      padding: 14px;
      background: rgba(192,54,42,0.07);
      border-left: 3px solid var(--danger);
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.7;
    }

    /* Exit path */
    .exit-section {
      background: var(--safe-bg);
      border-top: 1px solid rgba(26,138,120,0.2);
      border-bottom: 1px solid rgba(26,138,120,0.2);
    }

    .step-list {
      margin-top: 20px;
      display: grid;
      gap: 0;
    }

    .step-item {
      display: flex;
      gap: 16px;
      padding: 18px 0;
      border-bottom: 1px solid rgba(26,138,120,0.12);
    }
    .step-item:last-child { border-bottom: none; }

    .step-num {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: rgba(26,138,120,0.3);
      font-weight: 900;
      line-height: 1;
      flex-shrink: 0;
      width: 36px;
    }

    .step-content { }
    .step-title {
      font-size: 13px;
      color: var(--text);
      margin-bottom: 4px;
    }
    .step-desc {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.7;
    }
    .step-contact {
      font-size: 13px;
      color: var(--safe);
      margin-top: 4px;
      letter-spacing: 0.05em;
    }

    .closing-thought {
      margin-top: 24px;
      padding: 20px;
      background: rgba(26,138,120,0.06);
      border-radius: var(--radius);
      border: 1px solid rgba(26,138,120,0.15);
      font-size: 13px;
      color: var(--safe);
      line-height: 1.8;
      font-style: italic;
      font-family: 'Playfair Display', serif;
    }

    /* Recalculate */
    .recalc-btn {
      width: 100%;
      background: transparent;
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      padding: 14px;
      color: var(--muted);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      cursor: pointer;
      margin-top: 20px;
      letter-spacing: 0.1em;
      transition: border-color 0.2s, color 0.2s;
    }
    .recalc-btn:hover { border-color: var(--accent); color: var(--accent); }

    /* Share */
    .share-section {
      padding: 32px 20px;
      text-align: center;
      border-top: 1px solid var(--border);
    }

    .share-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      margin-bottom: 8px;
    }
    .share-sub {
      font-size: 11px;
      color: var(--muted);
      margin-bottom: 20px;
      line-height: 1.7;
    }
    .share-btn {
      display: inline-block;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 14px 28px;
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    .share-btn:hover { background: #1aad53; }

    /* Footer */
    footer {
      padding: 32px 20px;
      border-top: 1px solid var(--border);
      color: var(--faint);
      font-size: 10px;
      letter-spacing: 0.1em;
      line-height: 2;
    }

    .footer-brand {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: var(--accent);
      margin-bottom: 8px;
    }

    .footer-disclaimer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-size: 10px;
      color: var(--faint);
      line-height: 1.8;
    }

    /* Animations */
    .fade-in {
      opacity: 0;
      transform: translateY(16px);
      animation: fadeUp 0.5s ease forwards;
    }
    @keyframes fadeUp {
      to { opacity: 1; transform: translateY(0); }
    }

    .counting { transition: all 0.05s; }

    /* Responsive */
    @media (min-width: 600px) {
      .hero { padding: 80px 40px 60px; }
      .section { padding: 48px 40px; }
      nav { padding: 16px 40px; }
      .cost-row { grid-template-columns: 1fr 1fr; }
      .reckoning-header { padding: 40px; }
      .share-section { padding: 40px; }
      footer { padding: 40px; }
    }

    @media (min-width: 900px) {
      .hero { padding: 100px 60px 80px; }
      .section { padding: 60px; max-width: 780px; margin: 0 auto; }
      nav { padding: 18px 60px; }
      .reckoning-header { padding: 60px; }
    }
  </style>
</head>

<body>

<!-- ── Navigation ── -->
<nav>
  <div>
    <div class="nav-brand">Debt Mirror</div>
    <div class="nav-tag">South Africa · Free Tool</div>
  </div>
  <a href="#calculator" class="nav-cta">Calculate Now</a>
</nav>

<!-- ── Hero ── -->
<section class="hero">
  <div class="hero-eyebrow">For South African Government Employees</div>
  <h1>Your loan costs more than<br />you <em>think.</em></h1>
  <p class="hero-body">
    Loan sharks don't always operate on street corners anymore. They operate inside your payslip. 
    This tool shows you the true cost of your loan — in plain, honest, South African terms.
    No sign-up. No data stored. Just the truth.
  </p>
  <div class="scroll-indicator" onclick="document.getElementById('calculator').scrollIntoView({behavior:'smooth'})">
    <div class="scroll-arrow">↓</div>
    Calculate your loan
  </div>
  <div class="hero-stats">
    <div class="stat-item">
      <span class="stat-num">73%</span>
      <span class="stat-label">Of SA govt employees<br/>have active debt</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">R3,500</span>
      <span class="stat-label">Average monthly<br/>garnishee deduction</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">5x</span>
      <span class="stat-label">What loan sharks charge<br/>vs registered lenders</span>
    </div>
  </div>
</section>

<!-- ── Calculator ── -->
<section class="section" id="calculator">
  <div class="section-label">The Calculator</div>
  <h2 class="section-title">Enter your loan details</h2>
  <p style="color:var(--muted);font-size:12px;margin-top:6px;">Everything stays on your device. We store nothing.</p>

  <div class="form-grid">
    <div class="form-group">
      <label for="principal">How much did you borrow? *</label>
      <div class="input-wrap">
        <span class="input-prefix">R</span>
        <input type="number" id="principal" placeholder="5 000" min="1" />
      </div>
    </div>

    <div class="form-group">
      <label for="payment">What do you pay back monthly? *</label>
      <div class="input-wrap">
        <span class="input-prefix">R</span>
        <input type="number" id="payment" placeholder="900" min="1" />
      </div>
    </div>

    <div class="form-group">
      <label for="months">Total months to repay *</label>
      <div class="input-wrap">
        <span class="input-prefix">#</span>
        <input type="number" id="months" placeholder="18" min="1" max="360" />
      </div>
    </div>

    <div style="border-top:1px solid var(--border);padding-top:20px;">
      <div class="divider-label">Optional — gives more context</div>
    </div>

    <div class="form-group">
      <label for="monthsPaid">How many months have you already paid?</label>
      <div class="inp
