/* =========================================================
   Keystone South Construction — Main JavaScript
   Scroll animations · Parallax · Mobile nav · Form
   Premium interactions · Spotlight · Slider · Showcase
   ========================================================= */

(() => {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────── */
  const nav        = document.getElementById('nav');
  const hamburger  = document.querySelector('.nav-hamburger');
  const navLinks   = document.querySelector('.nav-links');
  const heroBg     = document.querySelector('.hero-bg');
  const heroParticles = document.querySelector('.hero-particles');
  const stickyBar  = document.getElementById('sticky-bar');
  const contactForm = document.getElementById('contactForm');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');
  const mobileViewportQuery = window.matchMedia('(max-width: 760px)');
  const shouldReduceMotion = () =>
    reducedMotionQuery.matches || coarsePointerQuery.matches || mobileViewportQuery.matches;

  function initAnalytics() {
    const analyticsMeta = document.querySelector('meta[name="ksc:ga4-measurement-id"]');
    const measurementId = analyticsMeta ? analyticsMeta.content.trim() : '';
    const isValidGa4Id = /^G-[A-Z0-9]+$/i.test(measurementId);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    if (isValidGa4Id) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);
      window.gtag('js', new Date());
      window.gtag('config', measurementId, { anonymize_ip: true });
    }

    return { enabled: isValidGa4Id };
  }

  const analytics = initAnalytics();

  function trackConversion(eventName, params = {}) {
    if (analytics.enabled && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  }

  function normalizeTextLabel(el) {
    return (el.textContent || '').trim().replace(/\s+/g, ' ');
  }

  /* ── Intersection Observer — reveal on scroll ──────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Scroll handler ────────────────────────────────────── */
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;

    /* Nav: darken on scroll */
    if (y > 60) {
      nav.style.background = 'rgba(10,10,10,0.95)';
    } else {
      nav.style.background = 'rgba(10,10,10,0.72)';
    }

    /* Hero parallax — multi-layer (Feature 2) */
    if (heroBg && !shouldReduceMotion()) {
      heroBg.style.transform = `translateY(${y * 0.35}px)`;
    }
    if (heroParticles && !shouldReduceMotion()) {
      heroParticles.style.transform = `translateY(${y * 0.18}px)`;
    }

    /* Sticky bar — show after scrolling 120 px */
    if (y > 120) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  /* ── Mobile hamburger ──────────────────────────────────── */
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      /* Animate bars */
      const bars = hamburger.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'translateY(7px) rotate(45deg)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      }
    });

    /* Close nav on link click */
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        const bars = hamburger.querySelectorAll('span');
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
      });
    });
  }

  /* ── Gallery parallax on large screens ────────────────── */
  const galleryItems = document.querySelectorAll('.gallery-img-wrap');

  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0 });

  if (window.innerWidth > 900 && !shouldReduceMotion()) {
    galleryItems.forEach(img => {
      galleryObserver.observe(img);
    });

    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        galleryItems.forEach(imgWrap => {
          if (!imgWrap.classList.contains('in-view')) return;
          const rect   = imgWrap.getBoundingClientRect();
          const center = window.innerHeight / 2;
          const offset = ((rect.top + rect.height / 2) - center) * 0.08;
          imgWrap.querySelector('img').style.transform =
            `translateY(${offset}px) scale(1.05)`;
        });
      });
    }, { passive: true });
  }

  /* ── Animated counter ──────────────────────────────────── */
  function animateCounter(el, target, duration = 1800) {
    let start = null;
    const suffix = el.dataset.suffix || '';

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackConversion('click_to_call', {
        event_category: 'engagement',
        event_label: normalizeTextLabel(link)
      });
    });
  });

  document.querySelectorAll('a[href="#contact"], .nav-cta, .sticky-btn, .showcase-step-cta').forEach((link) => {
    link.addEventListener('click', () => {
      trackConversion('quote_cta_click', {
        event_category: 'lead_generation',
        event_label: normalizeTextLabel(link)
      });
    });
  });

  /* ── Contact form ──────────────────────────────────────── */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn     = contactForm.querySelector('.btn-submit');
      const success = document.getElementById('formSuccess');
      const selectedService = contactForm.querySelector('#service');

      trackConversion('form_submit', {
        event_category: 'lead_generation',
        event_label: selectedService && selectedService.value ? selectedService.value : 'unspecified_service'
      });

      btn.textContent = 'Sending…';
      btn.disabled    = true;

      /* Simulate network delay — replace with real fetch/FormData call */
      setTimeout(() => {
        contactForm.reset();
        btn.textContent = 'Message Sent ✓';
        btn.style.background = '#22c55e';
        if (success) success.style.display = 'block';
        trackConversion('form_submit_success', { event_category: 'lead_generation' });

        setTimeout(() => {
          btn.textContent      = 'Send Message';
          btn.disabled         = false;
          btn.style.background = '';
          if (success) success.style.display = 'none';
        }, 4000);
      }, 1200);
    });
  }

  /* ── Smooth scroll for anchor links ───────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });

  /* ── Initial scroll check (page reload mid‑scroll) ─────── */
  onScroll();

  /* =========================================================
     PREMIUM FEATURES
     ========================================================= */

  /* ── Feature 7: Ambient cursor spotlight ─────────────────
     A radial gradient orb follows the cursor with ~8% lag    */
  const spotlight = document.querySelector('.cursor-spotlight');
  if (spotlight && !shouldReduceMotion()) {
    let spX = window.innerWidth / 2;
    let spY = window.innerHeight / 2;
    let targetX = spX;
    let targetY = spY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    /* Cache half-size once — spotlight is fixed at 700px */
    const spHalf = spotlight.offsetWidth / 2;

    (function animateSpotlight() {
      spX += (targetX - spX) * 0.08;
      spY += (targetY - spY) * 0.08;
      spotlight.style.transform = `translate(${spX - spHalf}px, ${spY - spHalf}px)`;
      requestAnimationFrame(animateSpotlight);
    })();
  }

  /* ── Feature 5: Magnetic hover — buttons ─────────────────
     Buttons shift slightly toward the cursor for a premium feel */
  if (!shouldReduceMotion()) {
    document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta, .sticky-btn').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width  / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        el.style.transform    = `translate(${x * 0.16}px, ${y * 0.16}px)`;
        el.style.transition   = 'transform 0.1s ease';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform  = '';
        el.style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)';
      });
    });
  }

  /* ── Feature 5: Card tilt — service cards ─────────────────
     Cards tilt 2–3° toward cursor for depth */
  if (!shouldReduceMotion()) {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width  / 2) / rect.width;
        const y = (e.clientY - rect.top  - rect.height / 2) / rect.height;
        card.style.transform  = `translateY(-4px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
        card.style.transition = 'transform 0.1s ease, box-shadow 0.3s, border-color 0.3s';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s, border-color 0.3s';
      });
    });
  }

  /* ── Feature 3: Before / After Slider ────────────────────
     Draggable vertical divider with auto-animate intro       */
  const baSlider   = document.querySelector('.ba-slider-wrap');
  if (baSlider) {
    const baBefore    = baSlider.querySelector('.ba-before');
    const baHandle    = baSlider.querySelector('.ba-handle');
    const baBeforeImg = baBefore.querySelector('img');
    let   baDragging  = false;

    /* Keep before-image at full container width so it clips correctly */
    function syncBeforeImgWidth() {
      baBeforeImg.style.width = baSlider.offsetWidth + 'px';
    }
    syncBeforeImgWidth();
    window.addEventListener('resize', syncBeforeImgWidth, { passive: true });

    function setSliderPos(clientX) {
      const rect = baSlider.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0.03, Math.min(0.97, pct));
      baBefore.style.width = (pct * 100) + '%';
      baHandle.style.left  = (pct * 100) + '%';
    }

    baSlider.addEventListener('mousedown',  (e) => { baDragging = true; setSliderPos(e.clientX); });
    window.addEventListener('mousemove',    (e) => { if (baDragging) setSliderPos(e.clientX); }, { passive: true });
    window.addEventListener('mouseup',      ()  => { baDragging = false; });
    baSlider.addEventListener('touchstart', (e) => { baDragging = true; setSliderPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove',    (e) => { if (baDragging) setSliderPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend',     ()  => { baDragging = false; });

    /* Intro animation: sweep from 72% → 50% on first scroll-in */
    const baIntroObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (shouldReduceMotion()) {
          setSliderPos(baSlider.getBoundingClientRect().left + 0.50 * baSlider.offsetWidth);
          baIntroObs.unobserve(entry.target);
          return;
        }
        /* Start at 72% then animate to 50% */
        setSliderPos(baSlider.getBoundingClientRect().left + 0.72 * baSlider.offsetWidth);
        let pos = 0.72;
        const step = () => {
          if (pos > 0.50) {
            pos -= 0.004;
            setSliderPos(baSlider.getBoundingClientRect().left + pos * baSlider.offsetWidth);
            requestAnimationFrame(step);
          }
        };
        setTimeout(() => requestAnimationFrame(step), 500);
        baIntroObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    baIntroObs.observe(baSlider);
  }

  /* ── Feature 6: Scroll-Synced Showcase ───────────────────
     As each text step enters view, crossfade to its image    */
  const showcaseSteps = document.querySelectorAll('.showcase-step');
  const showcaseImgs  = document.querySelectorAll('.showcase-img');

  if (showcaseSteps.length && showcaseImgs.length) {
    function activateStep(idx) {
      showcaseSteps.forEach((s, i) => s.classList.toggle('active', i === idx));
      showcaseImgs.forEach( (img, i) => img.classList.toggle('active', i === idx));
    }
    activateStep(0);

    const stepObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = parseInt(entry.target.dataset.index, 10);
        if (!isNaN(idx)) activateStep(idx);
      });
    }, { threshold: 0.55 });

    showcaseSteps.forEach(step => stepObs.observe(step));
  }

  /* ── Feature 12: Orange energy line — draw under headings ──
     A thin line draws L→R when the section title scrolls in  */
  const energyLineObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
        energyLineObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.section-line').forEach(line => energyLineObs.observe(line));

  /* ── Feature 9: Stats counter underline draw ──────────────
     Orange underline draws under each stat when it animates  */
  const underlineObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Stagger slightly after the counter starts */
        setTimeout(() => entry.target.classList.add('drawn'), 600);
        underlineObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-underline').forEach(ul => underlineObs.observe(ul));

  /* ── Feature 11: Room fly-in — gallery images zoom out ────
     Images start 8% zoomed; scale to 1.0 as they enter view  */
  if (!shouldReduceMotion()) {
    const flyObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const wrap = entry.target;
        const img  = wrap.querySelector('img');
        if (img) {
          img.style.transition = 'transform 1.4s cubic-bezier(0.25,0.46,0.45,0.94)';
          img.style.transform  = 'scale(1.0)';
        }
        wrap.classList.add('flown-in');
        flyObs.unobserve(wrap);
      });
    }, { threshold: 0.15 });

    /* Cache viewport height once to avoid repeated layout reads in loop */
    const vph = window.innerHeight;
    document.querySelectorAll('.gallery-img-wrap').forEach(wrap => {
      const img = wrap.querySelector('img');
      const rect = wrap.getBoundingClientRect();
      /* Only apply initial zoom to images starting below viewport */
      if (img && rect.top >= vph) {
        img.style.transform = 'scale(1.08)';
      } else {
        wrap.classList.add('flown-in');
      }
      flyObs.observe(wrap);
    });
  } else {
    document.querySelectorAll('.gallery-img-wrap').forEach(wrap => wrap.classList.add('flown-in'));
  }

  /* ── Feature 15: Gallery lightbox ────────────────────────
     Tap / click a gallery image to expand it full-screen     */
  function openLightbox(imgEl) {
    const lb = document.createElement('div');
    lb.className = 'mobile-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image preview');

    /* Build DOM safely — no innerHTML with user-controlled values */
    const lbImg = document.createElement('img');
    lbImg.src = imgEl.src;
    lbImg.alt = imgEl.alt;

    const lbClose = document.createElement('button');
    lbClose.className = 'lightbox-close';
    lbClose.setAttribute('aria-label', 'Close preview');
    lbClose.setAttribute('type', 'button');
    lbClose.textContent = '\u2715';

    lb.appendChild(lbImg);
    lb.appendChild(lbClose);
    document.body.appendChild(lb);

    /* Animate in */
    requestAnimationFrame(() => lb.classList.add('visible'));

    const close = () => {
      lb.classList.remove('visible');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => lb.remove(), 380);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };

    lb.addEventListener('click', close);
    lbClose.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    document.addEventListener('keydown', onKey);
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img);
    });
    /* Make focusable for keyboard accessibility */
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const img = item.querySelector('img');
        if (img) openLightbox(img);
      }
    });
  });

})();
