# Drakken Labs — Portfolio Site

Han Myo Naing's flagship public showcase. Built to be the proof of skill.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 6 |
| 3D | Three.js (Sentinel Companion) |
| Styling | Tailwind CSS 4 + custom design tokens |
| Language | TypeScript (strict) |
| Animations | IntersectionObserver + CSS |
| Fonts | Cinzel · Inter · JetBrains Mono · Instrument Serif |

## Running Locally

```bash
cd drakken-labs
npm install
npm run dev
```

Opens at **http://localhost:4321**

## Building for Production

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

## Deploying to Vercel

1. `git init && git add -A && git commit -m "Drakken Labs v1.0"`
2. Create GitHub repo and push
3. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
4. Framework preset: **Astro** (auto-detected) → Deploy

## Contact Form Setup

1. Sign up at [formspree.io](https://formspree.io) and create a form
2. In `src/components/Contact.astro`, replace `xpwrqdvj` with your form ID

## Easter Eggs

There are 4 hidden interactions — see `public/credits.md` for hints.

## Design Tokens

All live in `src/styles/global.css`:

```css
--void: #030308;        /* page background */
--signal-cyan: #00d4ff; /* primary accent */
--signal-violet: #a78bfa;
--signal-mint: #4ade80;
```

## Project Structure

```
src/
├── layouts/Layout.astro         # Base HTML, fonts, cursor
├── pages/index.astro            # Single-page site
├── components/
│   ├── SentinelCompanion.astro  # Three.js 3D orb companion
│   ├── Nav.astro
│   ├── Hero.astro               # Aurora bg + letter reveal
│   ├── Manifesto.astro
│   ├── Capabilities.astro       # 4-column Sacred Frame grid
│   ├── Showcase.astro           # Bento grid
│   ├── Process.astro            # 5-step process flow
│   ├── Investment.astro         # Pricing tiers
│   ├── Contact.astro            # Formspree form
│   └── Footer.astro
├── scripts/
│   ├── sentinel.ts              # Three.js Sentinel Companion
│   ├── transitions.ts           # Scroll reveal system
│   └── easterEggs.ts            # 4 hidden interactions
└── styles/
    └── global.css               # Design tokens + Tailwind
```

---

Built by Han Myo Naing · Drakken Labs · 2026
