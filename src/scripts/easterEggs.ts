const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'KeyB','KeyA',
];

const ORACLE_MESSAGES = [
  'The shield was only the beginning.',
  'Those who build in silence speak loudest.',
  'Every line of code is a letter to the future.',
  'The machine dreams of those who made it.',
  'From zero to empire. One commit at a time.',
  'Precision compounds. Chaos merely accumulates.',
  "The builder's edge: you ship what others only imagine.",
];

let oracleIndex = 0;

export function initEasterEggs(): void {
  initKonami();
  initTypeDrakken();
  initShiftBeam();
  initOracleListener();
}

/* ── 1. KONAMI CODE → BUILDER MODE ─────────────────────── */
function initKonami() {
  const buffer: string[] = [];

  document.addEventListener('keydown', (e) => {
    buffer.push(e.code);
    if (buffer.length > KONAMI.length) buffer.shift();
    if (buffer.join(',') === KONAMI.join(',')) {
      showBuilderMode();
    }
  });
}

function showBuilderMode() {
  const existing = document.getElementById('builder-mode-overlay');
  if (existing) return;

  const overlay = document.createElement('div');
  overlay.id = 'builder-mode-overlay';
  overlay.className = 'builder-mode-overlay';

  overlay.innerHTML = `
    <button class="close-btn" id="builder-close">[ ESC ] CLOSE</button>
    <div style="max-width: 600px; padding: 2rem; text-align: center;">
      <p style="
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 0.25em;
        color: #00d4ff;
        margin-bottom: 2rem;
      ">[ BUILDER MODE UNLOCKED ]</p>

      <h2 style="
        font-family: 'Cinzel', serif;
        font-size: 1.8rem;
        letter-spacing: 0.15em;
        color: #e8edf5;
        margin-bottom: 0.5rem;
      ">THIS SITE</h2>
      <p style="
        font-family: 'Cinzel', serif;
        font-size: 0.75rem;
        letter-spacing: 0.3em;
        color: #555c6e;
        margin-bottom: 3rem;
      ">ARCHITECTURE EXPOSED</p>

      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1px;
        background: #1f2330;
        border: 1px solid #1f2330;
        text-align: left;
        margin-bottom: 2rem;
      ">
        ${[
          ['Framework', 'Astro 6'],
          ['3D Engine', 'Three.js r169'],
          ['Animations', 'IntersectionObserver + CSS'],
          ['Styling', 'Tailwind CSS 4 + Custom Tokens'],
          ['Language', 'TypeScript (strict)'],
          ['Fonts', 'Cinzel · Inter · JetBrains Mono'],
          ['Build time', '~1.8s'],
          ['JS bundle', '< 200 KB'],
          ['Three.js scene', 'One 80×80 canvas'],
          ['Easter eggs', '4 (you found #1)'],
        ].map(([k, v]) => `
          <div style="background: #07080d; padding: 0.75rem 1rem;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #555c6e; letter-spacing: 0.12em; margin-bottom: 0.2rem;">${k}</div>
            <div style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #e8edf5;">${v}</div>
          </div>
        `).join('')}
      </div>

      <p style="
        font-family: 'Cinzel', serif;
        font-style: italic;
        font-size: 0.75rem;
        color: #555c6e;
        letter-spacing: 0.15em;
      ">Built by Han Myo Naing · Drakken Labs · 2025</p>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  const close = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 400);
  };

  document.getElementById('builder-close')?.addEventListener('click', close);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });
}

/* ── 2. SENTINEL 7-CLICK → ORACLE MODE ─────────────────── */
function initOracleListener() {
  document.addEventListener('sentinel:oracle', () => {
    showOracle();
  });
}

function showOracle() {
  const msg = ORACLE_MESSAGES[oracleIndex % ORACLE_MESSAGES.length]!;
  oracleIndex++;

  const overlay = document.createElement('div');
  overlay.className = 'oracle-overlay';
  overlay.innerHTML = `
    <p style="
      font-family: 'Cinzel', serif;
      font-style: italic;
      font-size: clamp(1rem, 2.5vw, 1.5rem);
      color: #e8edf5;
      letter-spacing: 0.08em;
      max-width: 560px;
      text-align: center;
      padding: 2rem;
      line-height: 1.8;
    ">${msg}</p>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 3500);
}

/* ── 3. TYPE "drakken" → SIGNATURE FLASH ───────────────── */
function initTypeDrakken() {
  const target = 'drakken';
  let buffer = '';

  document.addEventListener('keypress', (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

    buffer += e.key.toLowerCase();
    if (buffer.length > target.length) buffer = buffer.slice(-target.length);

    if (buffer === target) {
      buffer = '';
      triggerDrakkenFlash();
    }
  });
}

function triggerDrakkenFlash() {
  const flash = document.createElement('div');
  flash.className = 'drakken-flash';
  flash.style.display = 'flex';
  flash.style.alignItems = 'center';
  flash.style.justifyContent = 'center';

  flash.innerHTML = `
    <div style="text-align: center; pointer-events: none;">
      <div style="
        font-family: 'Cinzel', serif;
        font-size: clamp(3rem, 8vw, 7rem);
        letter-spacing: 0.32em;
        color: rgba(0,212,255,0.9);
        text-shadow: 0 0 40px rgba(0,212,255,0.6), 0 0 80px rgba(0,212,255,0.2);
        animation: drakkFlash 0.8s ease forwards;
      ">DRAKKEN</div>
      <div style="
        font-family: 'Cinzel', serif;
        font-size: 0.65rem;
        letter-spacing: 0.4em;
        color: rgba(0,212,255,0.5);
        margin-top: 0.5rem;
      ">IDENTIFIED</div>
    </div>
  `;

  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);
}

/* ── 4. SHIFT HOLD ON HERO → TRIPLE BEAM ───────────────── */
function initShiftBeam() {
  let beamsActive = false;

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Shift' || beamsActive) return;
    const hero = document.getElementById('hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    beamsActive = true;
    addExtraBeams();
  });

  document.addEventListener('keyup', (e) => {
    if (e.key !== 'Shift') return;
    beamsActive = false;
    removeExtraBeams();
  });
}

function addExtraBeams() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  ['beam-extra-l', 'beam-extra-r'].forEach((id, i) => {
    const b = document.createElement('div');
    b.id = id;
    b.style.cssText = `
      position: absolute;
      top: 0;
      left: ${i === 0 ? '35%' : '65%'};
      width: 1px;
      height: 60%;
      background: linear-gradient(to bottom, rgba(167,139,250,0.8), transparent);
      animation: beamDrop 0.4s ease forwards;
      pointer-events: none;
      z-index: 1;
    `;
    hero.style.position = 'relative';
    hero.appendChild(b);
  });
}

function removeExtraBeams() {
  ['beam-extra-l', 'beam-extra-r'].forEach((id) => {
    document.getElementById(id)?.remove();
  });
}
