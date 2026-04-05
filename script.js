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
      acc.className = 'accent'; acc.style.color = 'var(--green)';
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

window.addEventListener('load', () => {
  splitChars(document.getElementById('heroTitle'));

  gsap.to('#navbar', { y: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 });

  // Vídeo: zoom-out + fade-in na entrada
  gsap.fromTo('#hero-video',
    { scale: 1.08, opacity: 0 },
    { scale: 1,    opacity: 1, duration: 1.8, ease: 'power3.out', delay: 0 }
  );

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.25 });
  tl.to('#eyebrow',            { opacity: 1, duration: 0.7 }, 0);
  tl.to('.hero-title .char',   { opacity: 1, y: 0, rotate: 0, duration: 0.6, stagger: { each: 0.022, from: 'start' }, ease: 'back.out(1.5)' }, 0.2);
  tl.to('#heroSub',            { opacity: 1, y: 0, duration: 0.6 }, 0.85);
  tl.to('#heroActions',        { opacity: 1, y: 0, duration: 0.6 }, 1.05);
  tl.to('#scroll-hint',        { opacity: 1, duration: 0.6 }, 1.4);
});

// ══════════════════════════════════
// SCROLL REVEALS (outras seções)
// ══════════════════════════════════
document.querySelectorAll('.reveal').forEach(el => {
  gsap.to(el, { opacity:1, y:0, duration:0.75, ease:'power3.out',
    scrollTrigger:{ trigger:el, start:'top 88%', toggleActions:'play none none none' }
  });
});
document.querySelectorAll('.reveal-left').forEach(el => {
  gsap.to(el, { opacity:1, x:0, duration:0.8, ease:'power3.out',
    scrollTrigger:{ trigger:el, start:'top 85%' }
  });
});
document.querySelectorAll('.reveal-right').forEach(el => {
  gsap.to(el, { opacity:1, x:0, duration:0.8, ease:'power3.out',
    scrollTrigger:{ trigger:el, start:'top 85%' }
  });
});

// ══════════════════════════════════════════════════
// CORTINA + SOBRE — timeline unificada com pin
// ══════════════════════════════════════════════════
(function () {
  const FRAME_COUNT = 91;
  const canvas = document.getElementById('curtain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let DPR = window.devicePixelRatio || 1;

  function fitCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width  = w * DPR;
    canvas.height = h * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawFrame(proxy.frame);
  }

  const imgs = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = `curtain/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
    imgs.push(img);
  }

  function drawFrame(rawIdx) {
    const idx = Math.min(Math.max(Math.round(rawIdx), 0), FRAME_COUNT - 1);
    let img = imgs[idx];
    if (!img || !img.complete) {
      for (let j = idx - 1; j >= 0; j--) {
        if (imgs[j] && imgs[j].complete) { img = imgs[j]; break; }
      }
    }
    if (!img || !img.complete) return;
    // Coordenadas em CSS pixels (setTransform cuida do DPR)
    const cw = window.innerWidth, ch = window.innerHeight;
    const iw = img.naturalWidth,   ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale, sh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
  }

  const proxy = { frame: 0 };
  if (imgs[0].complete) { fitCanvas(); }
  else { imgs[0].addEventListener('load', fitCanvas); }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  // Auto-play ao entrar na viewport — sem pin, sem scrub
  ScrollTrigger.create({
    trigger: '#sobre',
    start: 'top 60%',
    once: true,
    onEnter() {
      // Mostra o canvas só agora que chegou no Sobre
      canvas.style.visibility = 'visible';
      canvas.style.opacity = '1';

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Cortina abre automaticamente em 2s (como vídeo)
      tl.to(proxy, {
        frame: FRAME_COUNT - 1,
        duration: 2,
        ease: 'none',
        onUpdate() { drawFrame(proxy.frame); }
      }, 0);

      // Canvas some
      tl.to(canvas, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 1.4);

      // Conteúdo emerge
      tl.to('.label-line',  { scaleX: 1, duration: 0.4 }, 1.3);
      tl.to('.label-text',  { opacity: 1, duration: 0.4 }, 1.5);
      tl.to('#sobre-title', { opacity: 1, y: 0, duration: 0.5 }, 1.6);
      tl.to('.sobre-para',  { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, 1.8);
      tl.to('.sobre-img',   { clipPath: 'inset(0 0% 0 0%)', duration: 0.7, ease: 'power3.inOut' }, 1.7);
      tl.to('#sobre-divider', { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, 2.1);
      tl.to('.sobre-stats', { opacity: 1, y: 0, duration: 0.5 }, 2.2);

      // Highlight CONEXTE
      tl.call(() => {
        const hw = document.getElementById('sobre-hw');
        if (!hw) return;
        gsap.to(hw, { color: '#26A5FF', duration: 0.3, yoyo: true, repeat: 1, ease: 'none' });
        setTimeout(() => hw.classList.add('hw-active'), 300);
      }, [], 2.1);

      // Counters
      tl.call(() => {
        document.querySelectorAll('[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target);
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 1.8, ease: 'elastic.out(1, 0.5)',
            onUpdate() { el.textContent = Math.ceil(obj.val) + '+'; }
          });
        });
      }, [], 2.3);
    }
  });

})();

// ══════════════════════════════════
// ÁREAS — fade slide da seção + cards
// ══════════════════════════════════
ScrollTrigger.create({
  trigger: '#areas',
  start: 'top 80%',
  once: true,
  invalidateOnRefresh: true,
  onEnter() {
    const tl = gsap.timeline();

    tl.fromTo('#areas',
      { opacity: 0, y: 64 },
      { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', clearProps: 'transform' }
    );
    tl.fromTo('#areas .label-tag',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      '-=0.5'
    );
    tl.fromTo('#areas .section-h2',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      '-=0.4'
    );
    tl.to('.area-card',
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: { amount: 0.45 } },
      '-=0.25'
    );
    tl.fromTo('#areas .cta-center',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      '-=0.2'
    );
  }
});

// ══════════════════════════════════
// CONTATO: fade-slide ao entrar
// ══════════════════════════════════
ScrollTrigger.create({
  trigger: '#contato',
  start: 'top 75%',
  once: true,
  invalidateOnRefresh: true,
  onEnter() {
    const tl = gsap.timeline();
    tl.fromTo('#contato .contato-info',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'transform' }
    );
    tl.fromTo('#contato .contato-form-box',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'transform' },
      '-=0.55'
    );
  }
});

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

  // Fase 5 — abertura: metades se afastam revelando o hero
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
  }, [], 2.65);
})();

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
