export function initTransitions(): void {
  // Scroll-triggered reveal using IntersectionObserver
  // (lighter than Motion for simple fade-up reveals)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.dataset.delay ?? '0';
          setTimeout(() => {
            el.classList.add('visible');
          }, parseInt(delay, 10));
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    observer.observe(el);
  });

  // Staggered children
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((parent) => {
    const children = parent.querySelectorAll<HTMLElement>('.stagger-child');
    children.forEach((child, i) => {
      child.dataset.delay = String(i * 60);
      observer.observe(child);
    });
  });

  // Section-aware nav highlight
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');
  const sections = document.querySelectorAll<HTMLElement>('section[id]');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            const href = link.getAttribute('href')?.replace('#', '');
            link.classList.toggle('nav-active', href === entry.target.id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => navObserver.observe(s));

  // Horizontal process line animation
  const processLine = document.querySelector<HTMLElement>('.process-line-fill');
  if (processLine) {
    const lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            processLine.style.transform = 'scaleX(1)';
            lineObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    lineObserver.observe(processLine.parentElement ?? processLine);
  }

  // Aurora scroll parallax
  const aurora1 = document.querySelector<HTMLElement>('.aurora-1');
  const aurora2 = document.querySelector<HTMLElement>('.aurora-2');
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (aurora1) aurora1.style.transform = `translateY(${y * 0.08}px)`;
      if (aurora2) aurora2.style.transform = `translateY(${y * 0.05}px)`;
    },
    { passive: true }
  );
}
