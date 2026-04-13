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
    const segments = part.split(/(<span class="[^"]+">[^<]+<\/span>)/g).filter(Boolean);
    let shouldAddGap = false;

    segments.forEach((segment) => {
      const spanMatch = segment.match(/^<span class="([^"]+)">([^<]+)<\/span>$/);
      const className = spanMatch ? spanMatch[1] : '';
      const content = (spanMatch ? spanMatch[2] : segment).trim();
      if (!content) return;

      content.split(/\s+/).forEach((word) => {
        if (!word) return;
        if (shouldAddGap) {
          const gap = document.createElement('span');
          gap.className = 'gap';
          el.appendChild(gap);
        }

        const wordEl = document.createElement('span');
        wordEl.className = 'word';
        if (className) wordEl.classList.add(className);

        word.split('').forEach((c) => {
          const charEl = document.createElement('span');
          charEl.className = 'char';
          charEl.textContent = c;
          wordEl.appendChild(charEl);
        });

        el.appendChild(wordEl);
        shouldAddGap = true;
      });
    });

    if (pi < parts.length-1) el.appendChild(document.createElement('br'));
  });
}

// ══════════════════════════════════
// EFEITO MATRIX — scramble sem layout shift
// ══════════════════════════════════
// Apenas chars de largura similar às latinas para evitar quebra de layout
const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&?!<>';
const BINARY_CHARS = '01';

function scrambleChar(el, duration = 0.48, glowColor = 'rgba(38,165,255,0.95)', chars = MATRIX_CHARS) {
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
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    tick++;
  }, (duration * 1000) / ticks);
}

// Aplica stagger em array de chars
function matrixReveal(charEls, stagger = 0.038) {
  charEls.forEach((el, i) => {
    gsap.set(el, { opacity: 1 });
    setTimeout(() => scrambleChar(el, 0.48, 'rgba(38,165,255,0.95)', BINARY_CHARS), i * stagger * 1000);
  });
}

// Hover individual em cada .char
function bindCharHover() {
  document.querySelectorAll('.hero-title .char').forEach(el => {
    el.addEventListener('mouseenter', () => scrambleChar(el, 0.34, 'rgba(93,183,255,0.95)', BINARY_CHARS));
  });
}

window.addEventListener('load', () => {
  const heroTitle = document.getElementById('heroTitle');
  heroTitle.innerHTML = heroTitle.innerHTML.replace('CONEXTE', '<span class="hero-brand">CONEXTE</span>');
  splitChars(heroTitle);

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
    { opacity: 0, y: 32, filter: 'blur(10px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
    }
  );
});
document.querySelectorAll('.reveal-left').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, x: -36, filter: 'blur(10px)' },
    { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    }
  );
});
document.querySelectorAll('.reveal-right').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, x: 36, filter: 'blur(10px)' },
    { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    }
  );
});

// ══════════════════════════════════
// SECTION TRANSITIONS — reveal suave + divisores
// ══════════════════════════════════
(function initSectionTransitions() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const collect = (selectors) => selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));

  document.querySelectorAll('.section-wave-bottom svg').forEach((svg) => {
    gsap.fromTo(svg,
      { opacity: 0, y: -24, scaleX: 0.97, scaleY: 0.9, filter: 'blur(8px)' },
      {
        opacity: 1,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        filter: 'blur(0px)',
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: svg.closest('.section-wave-bottom'),
          start: 'top bottom-=90',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        }
      }
    );
  });

  document.querySelectorAll('.navy-stripes').forEach((stripes) => {
    const section = stripes.closest('section');
    if (!section || prefersReducedMotion.matches) return;
    gsap.to(stripes, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.1,
      }
    });
  });

  if (prefersReducedMotion.matches) return;

  const plans = [
    {
      trigger: '#solucoes',
      steps: [
        { selectors: ['#solucoes .label-tag', '#solucoes .section-h2'], y: 28, stagger: 0.08, duration: 0.74 },
        { selectors: ['#solucoes .areas-grid .area-card'], y: 54, stagger: 0.09, duration: 0.88 },
        { selectors: ['#solucoes .cta-center'], y: 26, stagger: 0, duration: 0.68 }
      ]
    },
    {
      trigger: '#areas',
      steps: [
        { selectors: ['#areas .label-tag', '#areas .section-h2'], y: 28, stagger: 0.08, duration: 0.74 },
        { selectors: ['#areas .areas-showcase-card'], y: 56, stagger: 0.08, duration: 0.9 }
      ]
    },
    {
      trigger: '#contato',
      steps: [
        { selectors: ['#contato .label-tag', '#contato .section-h2', '#contato .contato-lead', '#contato .contato-meta'], y: 26, stagger: 0.08, duration: 0.74 },
        { selectors: ['#contato .contato-card'], y: 34, stagger: 0.08, duration: 0.76 },
        { selectors: ['#contato .contato-form-box'], y: 42, stagger: 0, duration: 0.82 }
      ]
    }
  ];

  plans.forEach((plan) => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: plan.trigger,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
        invalidateOnRefresh: true,
      }
    });

    let offset = 0;
    plan.steps.forEach((step) => {
      const elements = collect(step.selectors);
      if (!elements.length) return;
      timeline.fromTo(elements,
        { opacity: 0, y: step.y, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: step.duration,
          stagger: step.stagger,
          ease: 'power3.out'
        },
        offset
      );
      offset += 0.16;
    });
  });
})();

// ══════════════════════════════════
// AREAS — card spotlight interaction
// ══════════════════════════════════
(function () {
  const grid = document.querySelector('.areas-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.area-card'));
  const hoverCapable = window.matchMedia('(hover:hover) and (pointer:fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeCard = null;
  let pointerFrame = null;
  let lastPointerEvent = null;

  function commitPointerSpot() {
    pointerFrame = null;
    if (!lastPointerEvent || !hoverCapable.matches) return;

    const card = lastPointerEvent.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((lastPointerEvent.clientX - rect.left) / rect.width) * 100;
    const y = ((lastPointerEvent.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty('--spot-x', `${Math.max(0, Math.min(100, x)).toFixed(2)}%`);
    card.style.setProperty('--spot-y', `${Math.max(0, Math.min(100, y)).toFixed(2)}%`);
    lastPointerEvent = null;
  }

  function setActive(card) {
    if (!card || activeCard === card) return;
    activeCard = card;
    cards.forEach((item) => item.classList.toggle('is-active', item === card));
    grid.classList.add('has-active-card');
  }

  function clearActive() {
    activeCard = null;
    cards.forEach((item) => item.classList.remove('is-active'));
    grid.classList.remove('has-active-card');
  }

  function clearIfNoFocus() {
    if (!grid.contains(document.activeElement)) clearActive();
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
      lastPointerEvent = event;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(commitPointerSpot);
    });
    card.addEventListener('pointerleave', (event) => {
      card.style.removeProperty('--spot-x');
      card.style.removeProperty('--spot-y');
      if (hoverCapable.matches && activeCard === card && !grid.contains(event.relatedTarget)) {
        clearIfNoFocus();
      }
    });
    card.addEventListener('focusin', () => {
      setActive(card);
    });
    card.addEventListener('focusout', (event) => {
      if (!grid.contains(event.relatedTarget)) clearActive();
    });
    card.addEventListener('click', () => {
      if (!hoverCapable.matches) {
        if (activeCard === card) {
          clearActive();
          return;
        }
      }
      setActive(card);
    });
  });

  if (!hoverCapable.matches) {
    document.addEventListener('pointerdown', (event) => {
      if (!grid.contains(event.target)) clearActive();
    }, { passive: true });
  }

  grid.addEventListener('mouseleave', () => {
    if (hoverCapable.matches) clearIfNoFocus();
  });

  window.addEventListener('blur', clearActive);

  if (reducedMotion.matches) {
    cards.forEach((card) => {
      card.style.removeProperty('opacity');
      card.style.removeProperty('transform');
      card.style.removeProperty('filter');
    });
  }
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
// SOBRE — mapa Brasil com three.js
// ══════════════════════════════════
(function initSobreMapScene() {
  const stage = document.getElementById('sobreMapStage');
  const shell = stage ? stage.closest('.sobre-visual-shell') : null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!stage || !shell || prefersReducedMotion.matches || typeof THREE === 'undefined') return;
  if (!window.WebGLRenderingContext) return;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.08, 8.2);

  const scrollRig = new THREE.Group();
  const hoverRig = new THREE.Group();
  scene.add(scrollRig);
  scrollRig.add(hoverRig);

  const ambient = new THREE.AmbientLight(0xd9ebff, 2.2);
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(2.8, 2.6, 5.2);
  const rim = new THREE.PointLight(0x44b4ff, 18, 28, 2);
  rim.position.set(-3.8, 0.8, 5);
  const accent = new THREE.PointLight(0xc8d400, 6.5, 18, 2);
  accent.position.set(3.6, -2.2, 3.2);
  scene.add(ambient, key, rim, accent);

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(8.4, 5.1),
    new THREE.MeshBasicMaterial({
      color: 0x4ac3ff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  halo.position.set(0, 0, -2.2);
  scrollRig.add(halo);

  const radarRings = [
    { outer: 3.2, inner: 3.16, opacity: 0.12, z: -1.8 },
    { outer: 2.6, inner: 2.56, opacity: 0.09, z: -1.6 },
    { outer: 2.0, inner: 1.97, opacity: 0.08, z: -1.4 },
  ].map((ring) => {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(ring.inner, ring.outer, 96),
      new THREE.MeshBasicMaterial({
        color: 0xe6f8ff,
        transparent: true,
        opacity: ring.opacity,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    mesh.rotation.x = Math.PI / 2.34;
    mesh.position.z = ring.z;
    scrollRig.add(mesh);
    return mesh;
  });

  function createArc(points, color, opacity, radius) {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(point[0], point[1], point[2])));
    const geometry = new THREE.TubeGeometry(curve, 64, radius, 10, false);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Mesh(geometry, material);
  }

  const arcs = [
    createArc([[-2.85, -0.92, -0.4], [-1.5, 1.12, 0.95], [0.2, 0.25, 0.4], [2.55, 0.92, -0.25]], 0xf4fbff, 0.14, 0.015),
    createArc([[-2.35, 0.78, -0.2], [-0.65, 1.6, 0.82], [1.05, 0.05, 0.46], [2.24, -0.68, -0.12]], 0xa4e8ff, 0.18, 0.012),
    createArc([[-1.9, -1.28, -0.1], [-0.18, -0.14, 1.04], [1.12, 1.08, 0.58], [2.6, -0.16, 0.02]], 0xffffff, 0.12, 0.011),
    createArc([[-2.5, 0.1, -0.28], [-0.95, 1.36, 0.84], [0.62, 1.18, 0.72], [2.2, 0.18, -0.06]], 0xc8d400, 0.08, 0.01),
  ];
  arcs.forEach((arc) => hoverRig.add(arc));

  const nodeSeeds = [
    { x: -2.7, y: 1.14, z: 0.48, size: 0.05, color: 0xffffff, phase: 0.1, opacity: 0.8 },
    { x: -2.18, y: 0.42, z: 0.28, size: 0.04, color: 0xffffff, phase: 0.9, opacity: 0.68 },
    { x: -1.45, y: 0.26, z: 0.24, size: 0.035, color: 0xffffff, phase: 1.7, opacity: 0.62 },
    { x: -0.52, y: -0.48, z: 0.34, size: 0.055, color: 0xffffff, phase: 2.2, opacity: 0.84 },
    { x: 0.24, y: 1.06, z: 0.44, size: 0.04, color: 0xffffff, phase: 2.9, opacity: 0.72 },
    { x: 0.96, y: 0.14, z: 0.26, size: 0.038, color: 0xffffff, phase: 3.4, opacity: 0.62 },
    { x: 1.76, y: -0.18, z: 0.22, size: 0.048, color: 0xffffff, phase: 4.2, opacity: 0.76 },
    { x: 2.32, y: 0.84, z: 0.42, size: 0.036, color: 0xffffff, phase: 4.8, opacity: 0.62 },
    { x: -0.08, y: -1.28, z: 0.3, size: 0.06, color: 0xc8d400, phase: 5.2, opacity: 0.92 },
    { x: 1.28, y: -0.96, z: 0.28, size: 0.05, color: 0xc8d400, phase: 5.9, opacity: 0.84 },
  ];

  const nodes = nodeSeeds.map((seed) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(seed.size, 18, 18),
      new THREE.MeshBasicMaterial({
        color: seed.color,
        transparent: true,
        opacity: seed.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    mesh.position.set(seed.x, seed.y, seed.z);
    mesh.userData = seed;
    hoverRig.add(mesh);
    return mesh;
  });

  let mapMesh = null;

  const loader = new THREE.TextureLoader();
  loader.load(
    'brasil-network-map.jpeg',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      if (renderer.capabilities && typeof renderer.capabilities.getMaxAnisotropy === 'function') {
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      }

      const planeWidth = 6.65;
      const planeHeight = planeWidth / (1408 / 768);
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 56, 36);
      const positions = geometry.attributes.position;

      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index) / planeWidth;
        const y = positions.getY(index) / planeHeight;
        const bend = Math.sin((x + 0.5) * Math.PI) * 0.16 + Math.cos((y + 0.5) * Math.PI * 1.2) * 0.045;
        positions.setZ(index, bend);
      }

      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.86,
        metalness: 0.04,
        clearcoat: 0.24,
        clearcoatRoughness: 0.4,
        emissive: new THREE.Color(0x08284f),
        emissiveIntensity: 0.18,
      });

      mapMesh = new THREE.Mesh(geometry, material);
      mapMesh.position.z = 0.14;
      hoverRig.add(mapMesh);

      const edgeGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(planeWidth * 1.035, planeHeight * 1.04),
        new THREE.MeshBasicMaterial({
          color: 0x8fdcff,
          transparent: true,
          opacity: 0.08,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      edgeGlow.position.z = -0.08;
      hoverRig.add(edgeGlow);

      shell.classList.add('is-ready');
    },
    undefined,
    () => {
      shell.classList.remove('is-ready');
    }
  );

  const scrollState = {
    rotationY: -0.18,
    rotationX: -0.08,
    lift: 0.3,
  };

  if (window.gsap && window.ScrollTrigger) {
    gsap.to(scrollState, {
      rotationY: 0.12,
      rotationX: 0.03,
      lift: -0.16,
      ease: 'none',
      scrollTrigger: {
        trigger: '#sobre',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  }

  const pointer = {
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
  };

  function updatePointer(event) {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pointer.targetY = x * 0.48;
    pointer.targetX = -y * 0.22;
  }

  stage.addEventListener('pointermove', updatePointer, { passive: true });
  stage.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(width, height, false);
  }

  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(stage);
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let visible = true;
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        renderer.setAnimationLoop(visible ? renderFrame : null);
        if (visible) renderFrame(performance.now());
      },
      { threshold: 0.14 }
    );
    observer.observe(stage);
  }

  function renderFrame(time) {
    const t = time * 0.001;

    pointer.currentX += (pointer.targetX - pointer.currentX) * 0.06;
    pointer.currentY += (pointer.targetY - pointer.currentY) * 0.06;

    scrollRig.rotation.y = scrollState.rotationY;
    scrollRig.rotation.x = scrollState.rotationX;
    scrollRig.position.y = scrollState.lift;

    hoverRig.rotation.x = pointer.currentX;
    hoverRig.rotation.y = pointer.currentY;
    hoverRig.position.y = Math.sin(t * 0.72) * 0.09;
    hoverRig.position.x = Math.cos(t * 0.44) * 0.05;

    halo.material.opacity = 0.12 + (Math.sin(t * 1.1) + 1) * 0.022;
    halo.scale.setScalar(1 + Math.sin(t * 0.88) * 0.015);

    radarRings.forEach((ring, index) => {
      ring.rotation.z = t * (0.05 + index * 0.01);
      ring.material.opacity = 0.07 + (Math.sin(t * (0.8 + index * 0.12) + index) + 1) * 0.018;
    });

    arcs.forEach((arc, index) => {
      arc.rotation.z = Math.sin(t * 0.42 + index * 0.8) * 0.035;
      arc.material.opacity = 0.07 + (Math.sin(t * (1.2 + index * 0.1) + index) + 1) * 0.035;
    });

    nodes.forEach((node) => {
      const seed = node.userData;
      node.position.x = seed.x + Math.sin(t * 0.58 + seed.phase) * 0.03;
      node.position.y = seed.y + Math.cos(t * 0.76 + seed.phase) * 0.04;
      node.position.z = seed.z + Math.sin(t * 0.94 + seed.phase) * 0.02;
      const scale = 1 + (Math.sin(t * 1.7 + seed.phase) + 1) * 0.12;
      node.scale.setScalar(scale);
      node.material.opacity = Math.min(seed.opacity + (Math.sin(t * 2.2 + seed.phase) + 1) * 0.08, 1);
    });

    if (mapMesh) {
      mapMesh.rotation.z = Math.sin(t * 0.34) * 0.018;
      mapMesh.position.z = 0.14 + Math.sin(t * 0.92) * 0.035;
    }

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(renderFrame);
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
        node.style.transform = 'translateY(0) scale(1)';
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
      node.style.transform = 'translate(-50%,-50%) scale(1)';
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

  gsap.set('#areas, #areas .label-tag, #areas .section-h2', { opacity: 1, y: 0 });
  gsap.set(rings, { opacity: 1, scale: 1 });
  gsap.set(core, { opacity: 1, scale: 1 });
  gsap.set(nodes, { opacity: 1, y: 0, scale: 1 });

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
  const STATIC_FRAME = 99;
  const canvas = document.getElementById('cable-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let DPR = 1;
  let currentFrame = STATIC_FRAME;
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
    drawFrame(currentFrame);
  }

  if (imgs[currentFrame].complete) { init(); }
  else { imgs[currentFrame].addEventListener('load', init, { once: true }); }
  window.addEventListener('resize', () => { fitCanvas(); drawFrame(currentFrame); });
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
