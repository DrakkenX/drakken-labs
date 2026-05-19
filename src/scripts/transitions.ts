/**
 * Scroll reveal system — IntersectionObserver based.
 * GSAP used for number tweens and process line draw.
 * No window.addEventListener('scroll') for reveals.
 */

export function initTransitions(): void {
  initRevealObserver();
  initStaggerObserver();
  initNavHighlight();
  initProcessLine();
  initNumberTweens();
}

/* ── Generic .reveal + .reveal-up ────────────────────────── */
function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = parseInt(el.dataset['delay'] ?? '0', 10);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll<HTMLElement>('.reveal, .reveal-up').forEach((el) => {
    observer.observe(el);
  });
}

/* ── Stagger children ─────────────────────────────────────── */
function initStaggerObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const parent = entry.target as HTMLElement;
        const children = parent.querySelectorAll<HTMLElement>('.stagger-child');
        children.forEach((child, i) => {
          const baseDelay = parseInt(parent.dataset['staggerDelay'] ?? '0', 10);
          const step      = parseInt(parent.dataset['staggerStep']  ?? '80', 10);
          setTimeout(() => child.classList.add('visible'), baseDelay + i * step);
        });
        observer.unobserve(parent);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
  );

  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((el) => {
    observer.observe(el);
  });
}

/* ── Active nav link highlight ────────────────────────────── */
function initNavHighlight() {
  const links    = document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  if (!links.length || !sections.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const href = link.getAttribute('href')?.replace('#', '');
          const active = href === entry.target.id;
          link.classList.toggle('nav-active', active);
        });
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((s) => obs.observe(s));
}

/* ── Process line draw ────────────────────────────────────── */
function initProcessLine() {
  const line = document.querySelector<HTMLElement>('.process-line-fill');
  if (!line) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // CSS transition handles the draw animation
        line.style.transform = 'scaleX(1)';
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  const track = line.parentElement;
  if (track) obs.observe(track);
}

/* ── Number tween (Bloomberg-style) ─────────────────────── */
function initNumberTweens() {
  const elements = document.querySelectorAll<HTMLElement>('[data-count-to]');
  if (!elements.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const target = parseFloat(el.dataset['countTo'] ?? '0');
        const suffix = el.dataset['countSuffix'] ?? '';
        const duration = parseInt(el.dataset['countDuration'] ?? '1200', 10);
        tweenNumber(el, target, suffix, duration);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  elements.forEach((el) => obs.observe(el));
}

function tweenNumber(el: HTMLElement, target: number, suffix: string, duration: number) {
  const start     = performance.now();
  const isInt     = Number.isInteger(target);

  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = target * eased;
    el.textContent = (isInt ? Math.round(current) : current.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
