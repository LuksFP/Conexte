gsap.registerPlugin(ScrollTrigger);

// ══════════════════════════════════
// VÍDEO HERO — toca uma vez, para no último frame
// ══════════════════════════════════
const heroVideo = document.getElementById('hero-video');
const wrapper   = document.getElementById('hero');

if (heroVideo) {
  heroVideo.playbackRate = 1.0;

  // Ao terminar, mantém parado no último frame (sem voltar ao início)
  heroVideo.addEventListener('ended', () => {
    heroVideo.pause();
  });

  // Pausa quando o hero sair da viewport
  const heroObserver = new IntersectionObserver(
    ([entry]) => { if (!entry.isIntersecting) heroVideo.pause(); },
    { threshold: 0.1 }
  );
  heroObserver.observe(document.getElementById('hero'));
}

// ══════════════════════════════════
// SPLIT TEXT + HERO ENTRANCE
// ══════════════════════════════════
function splitChars(el) {
  const parts = el.innerHTML.split('<br>');
  el.innerHTML = '';
  parts.forEach((part, pi) => {
    if (part.includes('__HERO_GLYPH__')) {
      const [beforeGlyph, afterGlyph] = part.split('__HERO_GLYPH__');
      if (beforeGlyph.trim()) {
        beforeGlyph.trim().split(/\s+/).forEach((w) => {
          const wEl = document.createElement('span'); wEl.className = 'word';
          w.split('').forEach(c => { const s = document.createElement('span'); s.className = 'char'; s.textContent = c; wEl.appendChild(s); });
          el.appendChild(wEl);
          const g = document.createElement('span'); g.className = 'gap'; el.appendChild(g);
        });
      }
      el.appendChild(createHeroGlyph());
      part = afterGlyph;
    }
    const hasAccent = part.includes('class="accent"');
    if (hasAccent) {
      const [before, rest] = part.split('<span class="accent"');
      const inside = rest.slice(rest.indexOf('>') + 1).split('</span>')[0];
      if (before.trim()) {
        before.trim().split(/\s+/).forEach((w) => {
          const wEl = document.createElement('span'); wEl.className = 'word';
          w.split('').forEach(c => { const s = document.createElement('span'); s.className = 'char'; s.textContent = c; wEl.appendChild(s); });
          el.appendChild(wEl);
          const g = document.createElement('span'); g.className = 'gap'; el.appendChild(g);
        });
      }
      const acc = document.createElement('span');
      acc.className = 'accent'; acc.style.color = 'var(--blue)';
      const wEl = document.createElement('span'); wEl.className = 'word';
      inside.split('').forEach(c => { const s = document.createElement('span'); s.className = 'char'; s.textContent = c; wEl.appendChild(s); });
      acc.appendChild(wEl); el.appendChild(acc);
    } else {
      part.trim().split(/\s+/).forEach((w, wi, arr) => {
        if (!w) return;
        const wEl = document.createElement('span'); wEl.className = 'word';
        w.split('').forEach(c => { const s = document.createElement('span'); s.className = 'char'; s.textContent = c; wEl.appendChild(s); });
        el.appendChild(wEl);
        if (wi < arr.length-1) { const g = document.createElement('span'); g.className = 'gap'; el.appendChild(g); }
      });
    }
    if (pi < parts.length-1) el.appendChild(document.createElement('br'));
  });
}

function createHeroGlyph() {
  const wrap = document.createElement('span');
  wrap.className = 'hero-glyph-slot';
  wrap.setAttribute('aria-hidden', 'true');
  return wrap;
}

function buildHeroGlyphSvg() {
  return `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <defs>
        <linearGradient id="heroGlyphOuter" x1="22" y1="18" x2="96" y2="101" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#18568d"/>
          <stop offset="1" stop-color="#103f6a"/>
        </linearGradient>
        <linearGradient id="heroGlyphInner" x1="35" y1="30" x2="83" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#2aa3ff"/>
          <stop offset="1" stop-color="#177fd7"/>
        </linearGradient>
      </defs>
      <path class="hero-glyph-shell" d="M59 7L101 31L91 37L59 19L31 35V86L59 102L91 84L101 90L59 114L22 92V22Z" fill="url(#heroGlyphOuter)"/>
      <path class="hero-glyph-shell" d="M59 7L109 35L99 41L59 18L26 37L22 31Z" fill="url(#heroGlyphOuter)"/>
      <path class="hero-glyph-shell" d="M89 79L109 90L59 114L65 104Z" fill="url(#heroGlyphOuter)"/>
      <path class="hero-glyph-core" d="M59 26L85 41L77 46L59 35L42 45V75L59 85L77 75L85 80L59 96L34 81V40Z" fill="url(#heroGlyphInner)"/>
      <path class="hero-glyph-highlight" d="M59 11L96 32L90 35L59 17L31 33L27 31Z" fill="#ffffff" opacity=".14"/>
      <path class="hero-glyph-highlight" d="M59 30L81 42L76 45L59 36L44 45L44 41Z" fill="#ffffff" opacity=".18"/>
    </svg>`;
}

function initHeroGlyphMotion() {
  const heroSlot = document.querySelector('.hero-glyph-slot:not(.hero-glyph-slot-about)');
  const aboutSlot = document.querySelector('.hero-glyph-slot-about');
  const hero = document.getElementById('hero');
  const sobreTitle = document.getElementById('sobre-title');
  if (!heroSlot || !aboutSlot || !hero || !sobreTitle) return;

  let floating = document.getElementById('heroGlyphFloat');
  if (!floating) {
    floating = document.createElement('div');
    floating.id = 'heroGlyphFloat';
    floating.className = 'hero-glyph hero-glyph-float';
    floating.setAttribute('aria-hidden', 'true');
    floating.innerHTML = buildHeroGlyphSvg();
    document.body.appendChild(floating);
  }

  const state = { progress: 0 };
  let dockedInAbout = false;

  function getRectCenter(rect, size) {
    return {
      x: rect.left + (rect.width - size) / 2,
      y: rect.top + (rect.height - size) / 2,
    };
  }

  function renderGlyph() {
    if (dockedInAbout) return;
    const heroRect = heroSlot.getBoundingClientRect();
    const aboutRect = aboutSlot.getBoundingClientRect();
    const size = Math.max(heroRect.height * 1.02, 44);
    const start = getRectCenter(heroRect, size);
    const end = getRectCenter(aboutRect, size);
    const x = gsap.utils.interpolate(start.x, end.x, state.progress);
    const y = gsap.utils.interpolate(start.y, end.y, state.progress);
    const scale = gsap.utils.interpolate(1, 0.84, state.progress);
    const rotate = gsap.utils.interpolate(0, -6, state.progress);

    gsap.set(floating, {
      x,
      y,
      width: size,
      height: size,
      scale,
      rotate,
      opacity: 1,
    });
  }

  function undockGlyph() {
    if (!dockedInAbout) return;
    aboutSlot.innerHTML = '';
    floating.innerHTML = buildHeroGlyphSvg();
    gsap.set(floating, { opacity: 1 });
    dockedInAbout = false;
  }

  function dockGlyphIntoAbout() {
    if (dockedInAbout) return;
    aboutSlot.innerHTML = buildHeroGlyphSvg();
    gsap.set(floating, { opacity: 0 });
    dockedInAbout = true;
    const dockedSvg = aboutSlot.querySelector('svg');
    if (dockedSvg) {
      gsap.fromTo(dockedSvg,
        { scale: 0.92, rotate: -4, transformOrigin: '50% 50%' },
        { scale: 1, rotate: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }

  gsap.to(state, {
    progress: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      endTrigger: '#sobre-title',
      end: 'top 42%',
      scrub: 1.2,
      invalidateOnRefresh: true,
      onUpdate: self => {
        if (self.progress >= 0.999) {
          dockGlyphIntoAbout();
        } else {
          undockGlyph();
          renderGlyph();
        }
      },
      onRefresh: self => {
        if (self.progress >= 0.999) {
          dockGlyphIntoAbout();
        } else {
          undockGlyph();
          renderGlyph();
        }
      },
      onLeave: () => {
        state.progress = 1;
        dockGlyphIntoAbout();
      },
      onEnterBack: () => {
        undockGlyph();
        renderGlyph();
      },
      onLeaveBack: () => {
        state.progress = 0;
        undockGlyph();
        renderGlyph();
      },
    },
  });

  renderGlyph();

  gsap.to(floating.querySelector('.hero-glyph-core'), {
    scale: 1.035,
    duration: 2.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    transformOrigin: '50% 50%',
  });

  gsap.to(floating.querySelectorAll('.hero-glyph-highlight'), {
    opacity: 0.26,
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    stagger: 0.16,
    ease: 'sine.inOut',
  });
}

// ══════════════════════════════════
// EFEITO MATRIX — scramble sem layout shift
// ══════════════════════════════════
// Apenas chars de largura similar às latinas para evitar quebra de layout
const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&?!<>';

function scrambleChar(el, duration = 0.48, glowColor = 'rgba(38,165,255,0.95)') {
  if (el._scrambling) return;
  el._scrambling = true;
  const original = el.textContent;
  // Trava a largura antes de embaralhar para evitar layout shift
  const w = el.getBoundingClientRect().width;
  el.style.display    = 'inline-block';
  el.style.minWidth   = w + 'px';
  el.style.textAlign  = 'center';

  const ticks = Math.round(duration * 20);
  let tick = 0;
  const iv = setInterval(() => {
    if (tick >= ticks) {
      clearInterval(iv);
      el.textContent  = original;
      el.style.minWidth = '';
      el._scrambling  = false;
      gsap.fromTo(el,
        { textShadow: `0 0 14px ${glowColor}, 0 0 3px #fff` },
        { textShadow: '0 0 0px transparent', duration: 0.4, ease: 'power2.out' }
      );
      return;
    }
    el.textContent = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    tick++;
  }, (duration * 1000) / ticks);
}

// Aplica stagger em array de chars
function matrixReveal(charEls, stagger = 0.038) {
  charEls.forEach((el, i) => {
    gsap.set(el, { opacity: 1 });
    setTimeout(() => scrambleChar(el), i * stagger * 1000);
  });
}

// Hover individual em cada .char
function bindCharHover() {
  document.querySelectorAll('.hero-title .char').forEach(el => {
    el.addEventListener('mouseenter', () => scrambleChar(el, 0.3));
  });
}

window.addEventListener('load', () => {
  splitChars(document.getElementById('heroTitle'));
  initHeroGlyphMotion();

  gsap.to('#navbar', { y: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 });

  gsap.fromTo('#hero-video',
    { scale: 1.08 },
    { scale: 1, duration: 1.8, ease: 'power3.out', delay: 0 }
  );

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.25 });
  tl.to('#eyebrow',   { opacity: 1, duration: 0.7 }, 0);
  tl.to('#heroSub',   { opacity: 1, y: 0, duration: 0.6 }, 1.1);
  tl.to('#heroActions',{ opacity: 1, y: 0, duration: 0.6 }, 1.3);
  tl.to('#scroll-hint',{ opacity: 1, duration: 0.6 }, 1.7);
});

// ══════════════════════════════════
// SCROLL REVEALS (outras seções)
// ══════════════════════════════════
document.querySelectorAll('.reveal').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
    }
  );
});
document.querySelectorAll('.reveal-left').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, x: -36 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    }
  );
});
document.querySelectorAll('.reveal-right').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, x: 36 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    }
  );
});

// ══════════════════════════════════
// AREAS — card spotlight interaction
// ══════════════════════════════════
(function () {
  const grid = document.querySelector('.areas-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.area-card'));
  const hoverCapable = window.matchMedia('(hover:hover) and (pointer:fine)');

  function setActive(card) {
    cards.forEach((item) => item.classList.toggle('is-active', item === card));
    grid.classList.add('has-active-card');
  }

  function clearActive() {
    cards.forEach((item) => item.classList.remove('is-active'));
    grid.classList.remove('has-active-card');
  }

  cards.forEach((card) => {
    const title = card.querySelector('.area-title');
    if (title) card.setAttribute('aria-label', title.textContent.trim());
    card.tabIndex = 0;

    card.addEventListener('pointerenter', () => {
      if (hoverCapable.matches) setActive(card);
    });
    card.addEventListener('pointermove', (event) => {
      if (!hoverCapable.matches) return;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--spot-x', `${Math.max(0, Math.min(100, x)).toFixed(2)}%`);
      card.style.setProperty('--spot-y', `${Math.max(0, Math.min(100, y)).toFixed(2)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--spot-x');
      card.style.removeProperty('--spot-y');
      if (hoverCapable.matches && !grid.contains(document.activeElement)) clearActive();
    });
    card.addEventListener('focusin', () => setActive(card));
    card.addEventListener('focusout', (event) => {
      if (!grid.contains(event.relatedTarget)) clearActive();
    });
    card.addEventListener('click', () => {
      setActive(card);
    });
  });

  grid.addEventListener('mouseleave', () => {
    if (hoverCapable.matches && !grid.contains(document.activeElement)) clearActive();
  });

  window.addEventListener('blur', clearActive);
})();

// ══════════════════════════════════
// SOBRE — staggered reveal (estilo Framer Motion)
// ══════════════════════════════════
(function () {
  const sobreEl = document.getElementById('sobre');
  if (!sobreEl) return;

  // label tag
  const labelLine = sobreEl.querySelector('.label-line');
  const labelText = sobreEl.querySelector('.label-text');
  if (labelLine) { gsap.set(labelLine, { scaleX: 0 }); }
  if (labelText) { gsap.set(labelText, { opacity: 0 }); }

  // title
  const title = sobreEl.querySelector('#sobre-title');
  if (title) { gsap.set(title, { opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' }); }
    // paras
  const paras = sobreEl.querySelectorAll('.sobre-para');
  paras.forEach(p => gsap.set(p, { opacity: 0, y: 24 }));

  // image
  const img = sobreEl.querySelector('.sobre-img');
  if (img) { gsap.set(img, { clipPath: 'inset(0 0 100% 0)', borderRadius: '8px' }); }

  // divider
  const divider = sobreEl.querySelector('#sobre-divider');
  if (divider) { gsap.set(divider, { scaleX: 0 }); }

  // stats
  const stats = sobreEl.querySelector('.sobre-stats');
  if (stats) { gsap.set(stats, { opacity: 0, y: 20 }); }

  let revealed = false;
  const sobreTimeline = gsap.timeline({ paused: true });
  sobreTimeline
    .to(labelLine, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, 0)
    .to(labelText, { opacity: 1, duration: 0.5 }, 0.1)
    .to(title, { opacity: 1, clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.7, ease: 'power3.out' }, 0.15)
    .to(paras, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 0.4)
    .to(img, { clipPath: 'inset(0 0% 0% 0)', duration: 0.8, ease: 'power3.inOut' }, 0.3)
    .to(divider, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0.7)
    .to(stats, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.85);

  ScrollTrigger.create({
    trigger: '#sobre',
    start: 'top 70%',
    onEnter() {
      if (!revealed) {
        revealed = true;
        sobreTimeline.play();
        // counter animation nos stats
        setTimeout(() => {
          document.querySelectorAll('[data-target]').forEach(el => {
            const target = parseInt(el.dataset.target);
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target, duration: 1.8, ease: 'elastic.out(1, 0.5)',
              onUpdate() { el.textContent = Math.ceil(obj.val) + '+'; }
            });
          });
        }, 600);
      }
    },
    onLeaveBack() {
      if (revealed) {
        sobreTimeline.reverse(0.3);
        revealed = false;
      }
    }
  });

  // highlight word
  const hw = document.getElementById('sobre-hw');
  if (hw) {
    setTimeout(() => {
      gsap.to(hw, { color: '#26A5FF', duration: 0.3, yoyo: true, repeat: 1, ease: 'none' });
      setTimeout(() => hw.classList.add('hw-active'), 300);
    }, 1200);
  }
})();

// ══════════════════════════════════
// ÁREAS — cards nascem no centro e se espalham para o grid
// ══════════════════════════════════
(function initAreasIntro() {
  const areasGrid = document.querySelector('.areas-grid');
  const areaCardsForIntro = areasGrid ? Array.from(areasGrid.querySelectorAll('.area-card')) : [];
  if (!areasGrid || !areaCardsForIntro.length) return;

  const stackOffsets = [
    { x: -26, y: -14, r: -6, z: 16 },
    { x: -14, y: -8, r: -4, z: 15 },
    { x: -4, y: -2, r: -2, z: 14 },
    { x: 6, y: 2, r: 2, z: 13 },
    { x: 16, y: 8, r: 4, z: 12 },
    { x: 28, y: 14, r: 6, z: 11 },
  ];

  gsap.timeline({
    scrollTrigger: {
      trigger: '#solucoes',
      start: 'top 82%',
      toggleActions: 'play none none reverse',
      invalidateOnRefresh: true,
    }
  })
    .from('#solucoes', { opacity: 0, y: 64, duration: 0.85, ease: 'power3.out', immediateRender: false })
    .from('#solucoes .label-tag', { opacity: 0, y: 24, duration: 0.55, ease: 'power3.out', immediateRender: false }, '-=0.5')
    .from('#solucoes .section-h2', { opacity: 0, y: 24, duration: 0.55, ease: 'power3.out', immediateRender: false }, '-=0.4')
    .from(areaCardsForIntro, {
      opacity: 0,
      scale: 0.9,
      filter: 'blur(4px)',
      transformOrigin: '50% 50%',
      zIndex(i) {
        return stackOffsets[i % stackOffsets.length].z;
      },
      x(i, el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const viewportCenterX = window.innerWidth / 2;
        return (viewportCenterX - centerX) + stackOffsets[i % stackOffsets.length].x;
      },
      y(i, el) {
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const viewportCenterY = window.innerHeight / 2;
        return (viewportCenterY - centerY) + stackOffsets[i % stackOffsets.length].y;
      },
      rotation(i) {
        return stackOffsets[i % stackOffsets.length].r;
      },
      duration: 1.05,
      ease: 'power2.out',
      immediateRender: false,
      stagger: { each: 0.06, from: 'center' }
    }, '-=0.24')
    .to(areaCardsForIntro, {
      rotation: 0,
      filter: 'blur(0px)',
      duration: 0.38,
      ease: 'power1.out',
      stagger: { each: 0.018, from: 'center' }
    }, '<0.42')
    .from('#solucoes .cta-center', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', immediateRender: false }, '-=0.24');
})();

(function initAreasOrbit() {
  const orbit = document.getElementById('areasOrbit');
  if (!orbit) return;

  const nodes = Array.from(orbit.querySelectorAll('.areas-orbit-node'));
  const subtitlesByTitle = {
    'Órgãos Públicos': 'Modernização de processos, conformidade e eficiência para a gestão pública.',
    'Hospitais e Clínicas': 'Operação segura, proteção de dados críticos e mais confiabilidade no atendimento.',
    'Instituições de Ensino': 'Gestão digital, infraestrutura estável e melhor experiência para alunos e equipes.',
    'Hotéis, Restaurantes e Centros Comerciais': 'Operações mais ágeis, conectividade contínua e experiência melhor para o cliente.',
    'Empresas Comerciais e Corporativas': 'Produtividade, segurança e infraestrutura alinhada ao crescimento do negócio.',
    'Supermercados e Atacarejos': 'Controle operacional, redução de perdas e mais performance no varejo.'
  };
  const iconsByTitle = {
    'Órgãos Públicos': `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4h12v15H6z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
        <path d="M9 7h2v2H9zm4 0h2v2h-2zM9 11h2v2H9zm4 0h2v2h-2zM9 15h2v2H9zm4 0h2v2h-2z" fill="currentColor"/>
        <path d="M4 20h16" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      </svg>`,
    'Hospitais e Clínicas': `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 5h12v14H6z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
        <path d="M12 3v5M9.5 5.5h5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M9 10h2v2H9zm4 0h2v2h-2zM9 14h2v2H9zm4 0h2v2h-2z" fill="currentColor"/>
        <path d="M4 20h16" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      </svg>`,
    'Instituições de Ensino': `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9h18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M5 9 12 5l7 4" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
        <path d="M7 11v6M12 11v6M17 11v6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M4 19h16" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      </svg>`,
    'Hotéis, Restaurantes e Centros Comerciais': `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4v16M6 4v7a2 2 0 0 1-2 2V4M8 4v7a2 2 0 0 0 2 2V4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 4c1.9 0 3 1.8 3 4.2 0 2-1 3.8-2.4 4.5V20" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      </svg>`,
    'Empresas Comerciais e Corporativas': `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4h12v15H6z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
        <path d="M9 7h2v2H9zm4 0h2v2h-2zM9 11h2v2H9zm4 0h2v2h-2zM9 15h2v2H9zm4 0h2v2h-2z" fill="currentColor"/>
        <path d="M4 20h16" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      </svg>`,
    'Supermercados e Atacarejos': `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 7h13l-1.5 7H8L6.5 9H4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13 5.5v4M11 7.5h4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
        <circle cx="10" cy="18.2" r="1.6" fill="currentColor"/>
        <circle cx="16" cy="18.2" r="1.6" fill="currentColor"/>
      </svg>`
  };
  const rings = Array.from(orbit.querySelectorAll('.areas-orbit-ring'));
  const core = orbit.querySelector('.areas-orbit-center');
  const nodesWrap = orbit.querySelector('.areas-orbit-nodes');
  const mobileLayout = window.matchMedia('(max-width: 980px)');
  let openNode = null;

  nodes.forEach((node) => {
    const title = node.querySelector('h3');
    if (!title) return;

    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-expanded', 'false');

    if (!node.querySelector('.areas-orbit-node-card')) {
      const card = document.createElement('div');
      card.className = 'areas-orbit-node-card';
      while (node.firstChild) card.appendChild(node.firstChild);

      const subtitle = document.createElement('p');
      subtitle.className = 'areas-orbit-subtitle';
      subtitle.textContent = subtitlesByTitle[title.textContent.trim()] || '';
      card.appendChild(subtitle);
      node.appendChild(card);
    }

    const icon = node.querySelector('.areas-orbit-icon');
    if (icon && iconsByTitle[title.textContent.trim()]) {
      icon.innerHTML = iconsByTitle[title.textContent.trim()];
    }
  });

  const nodeCards = nodes.map((node) => node.querySelector('.areas-orbit-node-card')).filter(Boolean);

  function setOpenNode(target) {
    openNode = target === openNode ? null : target;
    nodes.forEach((node) => {
      const isOpen = node === openNode;
      node.classList.toggle('is-open', isOpen);
      node.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function positionOrbitNodes() {
    if (!nodesWrap || mobileLayout.matches) {
      nodes.forEach((node) => {
        node.style.left = '';
        node.style.top = '';
        node.style.transform = 'translateY(20px) scale(.96)';
      });
      return;
    }

    const orbitRect = orbit.getBoundingClientRect();
    const radius = Math.min(orbitRect.width, orbitRect.height) * 0.39;

    nodes.forEach((node) => {
      const angleDeg = Number(node.dataset.angle || 0);
      const angle = (angleDeg * Math.PI) / 180;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      node.style.left = `calc(50% + ${x.toFixed(2)}px)`;
      node.style.top = `calc(50% + ${y.toFixed(2)}px)`;
      node.style.transform = 'translate(-50%,-50%) scale(.96)';
    });
  }

  nodes.forEach((node) => {
    node.addEventListener('click', () => setOpenNode(node));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpenNode(node);
      }
    });
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: '#areas',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      invalidateOnRefresh: true,
    }
  })
    .from('#areas', { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out', immediateRender: false })
    .from('#areas .label-tag', { opacity: 0, y: 20, duration: 0.45, ease: 'power3.out', immediateRender: false }, '-=0.45')
    .from('#areas .section-h2', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', immediateRender: false }, '-=0.3')
    .from(rings, {
      opacity: 0,
      scale: 0.9,
      duration: 0.85,
      stagger: 0.08,
      ease: 'power2.out',
      immediateRender: false
    }, '-=0.18')
    .from(core, {
      opacity: 0,
      scale: 0.84,
      duration: 0.7,
      ease: 'power3.out',
      immediateRender: false
    }, '-=0.5')
    .to(nodes, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.55,
      stagger: { each: 0.08, from: 'center' },
      ease: 'power3.out',
      immediateRender: false
    }, '-=0.3');

  gsap.to('#areas .areas-orbit-ring--outer', {
    rotate: 360,
    duration: 28,
    repeat: -1,
    ease: 'none',
    transformOrigin: '50% 50%'
  });

  if (nodesWrap && nodes.length) {
    positionOrbitNodes();
    window.addEventListener('resize', positionOrbitNodes);

    gsap.to(nodesWrap, {
      rotate: 360,
      duration: 42,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%'
    });

    gsap.to(nodeCards, {
      rotate: -360,
      duration: 42,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%'
    });
  }
})();

// ══════════════════════════════════
// CONTATO: fade-slide ao entrar
// ══════════════════════════════════
gsap.timeline({
  scrollTrigger: {
    trigger: '#contato',
    start: 'top 75%',
    toggleActions: 'play none none reverse',
    invalidateOnRefresh: true,
  }
})
  .fromTo('#contato .contato-info',    { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
  .fromTo('#contato .contato-form-box',{ opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55');

// ══════════════════════════════════
// NAV: transparente sobre hero, sólida no resto
// ══════════════════════════════════
// ══════════════════════════════════
// PRELOADER
// ══════════════════════════════════
(function() {
  // Garante que começa do topo e trava scroll
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = '0';
  document.body.style.left = '0';
  document.body.style.right = '0';

  const logoFullW = Math.round((400 / 75) * 52); // ~277px

  const tl = gsap.timeline();

  // Fase 1 — metades entram do topo/base com fundo navy visível
  tl.fromTo('.pre-half.top',
    { yPercent: -100 },
    { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 0
  )
  .fromTo('.pre-half.bot',
    { yPercent: 100 },
    { yPercent: 0, duration: 0.7, ease: 'power3.out' }, 0
  )

  // Fase 2 — linha central aparece
  .to('#pre-line', {
    scaleX: 1, duration: 0.5, ease: 'power2.out'
  }, 0.5)

  // Fase 3 — logo expande (clip reveal: ícone → logo completo)
  .fromTo('#pre-logo-wrap, #pre-logo-wrap-ref',
    { width: 52 },
    { width: logoFullW, duration: 0.7, ease: 'power3.inOut' },
    0.65
  )

  // Fase 4 — pulso sutil no logo completo
  .to('#pre-logo-wrap',
    { scale: 1.04, duration: 0.25, ease: 'power1.inOut', yoyo: true, repeat: 1 },
    1.5
  )

  // Fase 5  abertura: metades se afastam revelando o hero
  .to('.pre-half.top', {
    yPercent: -100, duration: 0.9, ease: 'expo.inOut'
  }, 2.0)
  .to('.pre-half.bot', {
    yPercent: 100, duration: 0.9, ease: 'expo.inOut'
  }, 2.0)
  .to('#pre-line', {
    opacity: 0, duration: 0.3
  }, 2.0)

  // Fase 6 — hero content anima ao aparecer
  .call(() => {
    document.getElementById('preloader').style.display = 'none';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    // Anima hero content
    gsap.fromTo('#hero-content',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
    );
        // Matrix: dispara após preloader abrir — espera chars estarem prontos
    (function waitForChars() {
      const chars = Array.from(document.querySelectorAll('.hero-title .char'));
      if (chars.length > 0) {
        setTimeout(() => { matrixReveal(chars); bindCharHover(); }, 120);
      } else {
        setTimeout(waitForChars, 50);
      }
    })();
  }, [], 2.65);
})();

// ══════════════════════════════════════════════════
// CABO DE REDE — canvas com 200 frames, scrub GSAP
// ══════════════════════════════════════════════════
(function () {
  const TOTAL = 200;
  const canvas = document.getElementById('cable-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let DPR = 1;
  let currentFrame = 0;
  const FRAME_DIRS = ['rede', 'frames'];
  let frameDir = FRAME_DIRS[0];

  function frameSrc(dir, i) {
    return `${dir}/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
  }

  // pré-carrega todos os frames
  const imgs = [];
  for (let i = 1; i <= TOTAL; i++) {
    const img = new Image();
    img.onerror = () => {
      const fallback = FRAME_DIRS.find(dir => dir !== frameDir);
      if (!fallback) return;
      frameDir = fallback;
      img.onerror = null;
      img.src = frameSrc(fallback, i);
    };
    img.src = frameSrc(frameDir, i);
    imgs.push(img);
  }

  function fitCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const section = document.getElementById('sobre');
    const w = section.offsetWidth;
    const h = section.offsetHeight;
    canvas.width  = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  function drawFrame(rawIdx) {
    const idx = Math.min(Math.max(Math.round(rawIdx), 0), TOTAL - 1);
    let img = imgs[idx];
    if (!img || !img.complete) {
      for (let j = idx - 1; j >= 0; j--) {
        if (imgs[j] && imgs[j].complete) { img = imgs[j]; break; }
      }
    }
    if (!img || !img.complete) return;
    const cw = canvas.width / DPR;
    const ch = canvas.height / DPR;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    // cover ancorado à direita — rack sempre visível no lado direito
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale, sh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, cw - sw, (ch - sh) / 2, sw, sh);
  }

  function init() {
    fitCanvas();
    drawFrame(0);
  }

  if (imgs[0].complete) { init(); }
  else { imgs[0].addEventListener('load', init); }
  window.addEventListener('resize', () => { fitCanvas(); drawFrame(currentFrame); });

  // Scrub: cabo anima conforme rola pelo #sobre
  ScrollTrigger.create({
    trigger: '#sobre',
    start: 'top 50%',
    end:   'bottom top',
    scrub: 0.35,
    onUpdate(self) {
      currentFrame = Math.round(Math.min(self.progress * 1.12, 1) * (TOTAL - 1));
      drawFrame(currentFrame);
    }
  });
})();

// gradiente hero→sobre: aparece só ao rolar para baixo
gsap.to('#hero-fade', {
  opacity: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'center top',
    end: 'bottom top',
    scrub: true,
  }
});

// parallax símbolo hero
gsap.to('#hero-symbol', {
  yPercent: 60,
  ease: 'none',
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});

const scrollC = document.getElementById('scroll-c');
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  const pastHero = window.scrollY > window.innerHeight * 0.85;
  if (pastHero) {
    nav.classList.add('scrolled');
    document.body.classList.add('scrolled-past-hero');
  } else {
    nav.classList.remove('scrolled');
    document.body.classList.remove('scrolled-past-hero');
  }
  // símbolo desce acompanhando o scroll
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const pct = Math.min(window.scrollY / maxScroll, 1);
  const maxY = window.innerHeight - 80;
  scrollC.style.transform = `translateY(${pct * maxY}px)`;
}, { passive: true });

// ══════════════════════════════════
// MOBILE MENU
// ══════════════════════════════════
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobileMenu');
ham.addEventListener('click', () => {
  const open = mob.classList.toggle('open');
  const [s1,s2,s3] = ham.querySelectorAll('span');
  if (open) { s1.style.transform='translateY(7px) rotate(45deg)'; s2.style.opacity='0'; s3.style.transform='translateY(-7px) rotate(-45deg)'; }
  else { [s1,s2,s3].forEach(s => { s.style.transform=''; s.style.opacity=''; }); }
});
function closeMob() {
  mob.classList.remove('open');
}
document.getElementById('mobileClose').addEventListener('click', closeMob);
document.querySelectorAll('.mm-link').forEach(a => {
  a.addEventListener('click', closeMob);
});

// ══════════════════════════════════
// FORM
// ══════════════════════════════════
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Enviando...'; btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Mensagem enviada!';
    btn.style.background = '#eafaf3'; btn.style.color = '#0A6640';
    setTimeout(() => { btn.textContent = 'Enviar'; btn.style.background=''; btn.style.color=''; btn.disabled=false; }, 3000);
  }, 1200);
});

// recalcula todos os triggers após o layout estar estável
gsap.delayedCall(0.3, () => ScrollTrigger.refresh());
