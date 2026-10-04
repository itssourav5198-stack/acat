(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    document.querySelector('header')?.classList.toggle('scrolled', window.scrollY > 12);
  };
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  const sections = [...document.querySelectorAll('section[id], footer[id]')];
  const navAnchors = [...document.querySelectorAll('.navlinks a[href^="#"]')];
  if ('IntersectionObserver' in window && navAnchors.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-30% 0px -62% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  document.querySelectorAll('.stat .num').forEach(number => {
    const raw = number.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match || reduceMotion) return;
    const target = Number(match[1]);
    const suffix = match[2];
    let started = false;
    const animate = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const tick = now => {
        const progressValue = Math.min((now - start) / 900, 1);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        number.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && animate()), { threshold: .7 }).observe(number);
    else animate();
  });

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.card, .post, .pricing-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * 3;
        const y = ((event.clientY - rect.top) / rect.height - .5) * -3;
        card.style.transform = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
})();
