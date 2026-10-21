/* =========================================================
   Portfolio Loan Heron — v2, motion sobre
   GSAP 3 + ScrollTrigger + Lenis. Mouvements lents, peu nombreux, sans effet gadget.
   ========================================================= */
(() => {
  'use strict';

  const d = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  /* Formulaire : les messages partent vers heronloan@gmail.com via FormSubmit (formsubmit.co), sans compte.
     Au tout premier envoi, FormSubmit envoie un e-mail d'activation à cette adresse : clique sur « Activate Form ».
     Mets FORM_ENDPOINT à '' pour revenir à l'ouverture de la messagerie du visiteur. */
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/heronloan@gmail.com';
  const save = (k, v, session) => { try { (session ? window.sessionStorage : window.localStorage).setItem(k, v); } catch (e) { /* stockage indisponible */ } };

  /* ---------- Langue FR / EN ---------- */
  const FR = {};
  $$('[data-i18n]').forEach((el) => { const k = el.dataset.i18n; if (!(k in FR)) FR[k] = el.innerHTML.trim(); });
  Object.assign(FR, window.I18N_FR_EXTRA || {});
  const EN = window.I18N_EN || {};
  let lang = 'fr';
  const t = (k) => (lang === 'en' && EN[k] != null ? EN[k] : FR[k]);

  function applyLang() {
    d.lang = lang;
    document.title = t('title');
    $$('[data-i18n]').forEach((el) => { const h = t(el.dataset.i18n); if (h != null) el.innerHTML = h; });
    $$('.lang__btn').forEach((b) => { const on = b.dataset.lang === lang; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    save('lh-lang', lang);
    if (typeof syncTheme === 'function') syncTheme();
  }
  function setLang(next) {
    if (next === lang) return;
    lang = next;
    const main = $('main');
    if (window.gsap && !reduced) {
      gsap.to(main, { opacity: 0, duration: 0.35, ease: 'power2.out', onComplete: () => {
        applyLang();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        gsap.to(main, { opacity: 1, duration: 0.6, ease: 'power2.out' });
      } });
      $$('.nav [data-i18n], .menu [data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
    } else applyLang();
  }
  $$('.lang__btn').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  if (d.getAttribute('data-lang-pref') === 'en') { lang = 'en'; applyLang(); }

  /* ---------- Thème clair / sombre ---------- */
  const themeBtn = $('#themeBtn');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  function syncTheme() {
    const th = d.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const label = t(th === 'dark' ? 'theme.toLight' : 'theme.toDark');
    if (themeBtn) { themeBtn.setAttribute('aria-label', label); themeBtn.title = label; }
    if (metaTheme) metaTheme.setAttribute('content', th === 'dark' ? '#070B14' : '#F3F1EC');
  }
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = d.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    d.setAttribute('data-theme', next);
    save('lh-theme', next);
    syncTheme();
  });
  syncTheme();

  /* ---------- Copier l'adresse ---------- */
  const toast = $('#toast');
  let toastTimer;
  const say = (m) => { if (!toast) return; toast.textContent = m; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.textContent = ''; }, 2600); };
  const copyBtn = $('#copyMail');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    const mail = 'heronloan@gmail.com';
    const fallback = () => {
      const a = $('.contact a[href^="mailto:"]');
      if (a) { const r = document.createRange(); r.selectNodeContents(a); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      say(t('copyFail'));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(() => say(t('copied')), fallback);
    else fallback();
  });

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const menu = $('#menu');
  let menuOpen = false;
  let lenis = null;
  function toggleMenu(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (lenis) (open ? lenis.stop() : lenis.start());
    if (open) {
      menu.hidden = false;
      if (window.gsap && !reduced) {
        gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo($$('.menu__links a', menu), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: 'expo.out', delay: 0.1 });
      }
      $('.menu__links a', menu).focus({ preventScroll: true });
    } else if (window.gsap && !reduced) {
      gsap.to(menu, { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: () => { menu.hidden = true; } });
    } else menu.hidden = true;
  }
  if (burger && menu) {
    burger.addEventListener('click', () => toggleMenu(!menuOpen));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { toggleMenu(false); burger.focus(); } });
  }

  /* ---------- Formulaire de contact ---------- */
  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');
    const rules = {
      'f-name': (v) => v.trim().length > 1,
      'f-email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      'f-msg': (v) => v.trim().length > 9
    };
    const check = (id) => {
      const el = $('#' + id); const ok = rules[id](el.value);
      const field = el.closest('.field'); const err = $('#' + id + '-err');
      field.classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (ok) { el.removeAttribute('aria-describedby'); err.textContent = ''; }
      else { el.setAttribute('aria-describedby', id + '-err'); err.textContent = t(err.dataset.err); }
      return ok;
    };
    Object.keys(rules).forEach((id) => {
      const el = $('#' + id);
      el.addEventListener('blur', () => { if (el.value) check(id); });
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('is-invalid')) check(id); });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).filter((id) => !check(id));
      if (bad.length) { $('#' + bad[0]).focus(); return; }
      const data = new FormData(form);
      if (data.get('_honey')) return; // robot
      const btn = $('button[type="submit"]', form);
      if (FORM_ENDPOINT) {
        btn.disabled = true; status.textContent = t('f.sending');
        try {
          const payload = {
            name: data.get('name'), email: data.get('email'), objet: data.get('topic'), message: data.get('message'),
            _subject: `Portfolio — ${data.get('topic')} — ${data.get('name')}`,
            _template: 'table'
          };
          const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
          const res = await r.json().catch(() => ({}));
          if (!r.ok || String(res.success) !== 'true') throw new Error(res.message || r.status);
          form.reset(); status.textContent = t('f.sent');
        } catch (err) {
          status.innerHTML = t('f.fail');
        } finally { btn.disabled = false; }
      } else {
        const subject = `${data.get('topic')} — ${data.get('name')}`;
        const body = `${data.get('message')}\n\n${data.get('name')} · ${data.get('email')}`;
        window.location.href = `mailto:heronloan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = t('f.mailto');
      }
    });
  }

  /* ---------- Mentions légales (panneau) ---------- */
  const legal = $('#legal');
  if (legal) {
    let lastFocus = null;
    const openLegal = (e) => {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      if (typeof legal.showModal === 'function') legal.showModal(); else legal.setAttribute('open', '');
      document.body.classList.add('menu-open');
      if (lenis) lenis.stop();
      $('.legal__close', legal).focus();
    };
    const closeLegal = () => {
      if (legal.open && typeof legal.close === 'function') legal.close(); else legal.removeAttribute('open');
    };
    legal.addEventListener('close', () => { document.body.classList.remove('menu-open'); if (lenis) lenis.start(); if (lastFocus) lastFocus.focus(); });
    $$('[data-open-legal]').forEach((a) => a.addEventListener('click', openLegal));
    $('.legal__close', legal).addEventListener('click', closeLegal);
    legal.addEventListener('click', (e) => { if (e.target === legal) closeLegal(); });
    if (location.hash === '#mentions-legales') openLegal();
  }

  /* ---------- Sans GSAP, le site reste complet ---------- */
  const skillsGrid = $('.skills__grid');
  if (!window.gsap || !window.ScrollTrigger) { d.classList.remove('intro-pending'); if (skillsGrid) skillsGrid.classList.add('is-filled'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Défilement fluide ---------- */
  if (window.Lenis && finePointer && !reduced) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.6 });
    else if (id === '#top') window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (id === '#top') return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }));

  /* ---------- Intro + entrée du hero ---------- */
  const intro = $('#intro');
  const navLogo = $('.nav .brand .logo');
  const nameLines = $$('.hero__name .line__in');
  const photo = $('.hero__photo');
  const photoImg = $('.hero__photo img');
  const heroFade = [$('.hero__role'), $('.hero__sub'), $('.hero__meta')].filter(Boolean);
  const navParts = [$('.brand span'), $('.nav__links'), $('.nav__actions')].filter(Boolean);

  function heroPrep() {
    gsap.set(nameLines, { yPercent: 105 });
    gsap.set(photoImg, { clipPath: 'inset(100% 0% 0% 0%)' });
    photo.classList.remove('is-lit');
    gsap.set(photoImg, { scale: 1.08, transformOrigin: '50% 100%' });
    gsap.set(heroFade, { opacity: 0, y: 14 });
    gsap.set(navParts, { opacity: 0 });
  }
  function heroIn(tl, at) {
    return tl
      .to(nameLines, { yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12 }, at)
      .to(photoImg, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, at + 0.1)
      .call(() => photo.classList.add('is-lit'), null, at + 0.4)
      .to(photoImg, { scale: 1, duration: 2.2, ease: 'expo.out' }, at + 0.1)
      .to(heroFade, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1 }, at + 0.5)
      .to(navParts, { opacity: 1, duration: 1.2, ease: 'power2.out', stagger: 0.08 }, at + 0.6);
  }

  if (reduced) {
    d.classList.remove('intro-pending');
    if (photo) photo.classList.add('is-lit');
  } else if (d.classList.contains('intro-pending') && intro) {
    if (lenis) lenis.stop();
    heroPrep();
    gsap.set(navLogo, { opacity: 0 });
    const svg = $('.intro__logo', intro);
    const pieces = $$('.piece', intro);
    const flash = $('.intro__flash', intro);
    const countEl = $('#introCount');
    const fill = $('.intro__fill', intro);
    const chrome = [$('.intro__label', intro), $('.intro__count', intro), $('.intro__bar', intro), $('#introSkip')];
    // Chaque pièce du L arrive d'un bord différent
    const from = [{ x: -380, y: 110, rotation: -12 }, { x: 150, y: -380, rotation: 10 }, { x: 420, y: 60, rotation: 8 }, { x: -150, y: 340, rotation: -6 }];
    pieces.forEach((p, i) => gsap.set(p, { ...from[i], opacity: 0, transformOrigin: '50% 50%' }));
    gsap.set(svg, { transformOrigin: '50% 50%' });
    const counter = { v: 0 };

    const tl = gsap.timeline({ paused: true, onComplete: () => {
      save('lh-intro', '1', true);
      d.classList.remove('intro-pending');
      intro.remove();
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    } });
    tl.to(counter, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0)
      .to(fill, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0)
      .to(pieces, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.35)
      // Le L se verrouille avec un léger rebond, un trait orange passe
      .to(svg, { scale: 0.94, duration: 0.14, ease: 'power2.in' }, 1.35)
      .to(svg, { scale: 1, duration: 0.6, ease: 'back.out(2.6)' }, 1.49)
      .fromTo(flash, { scaleX: 0, opacity: 1, rotation: -48 }, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, 1.49)
      .to(flash, { opacity: 0, duration: 0.4 }, 1.85)
      .to(chrome, { opacity: 0, duration: 0.4 }, 1.6)
      // Le L rejoint sa place dans la nav
      .set(svg, { transformOrigin: '0% 0%' }, 2.1)
      .to(svg, {
        x: () => navLogo.getBoundingClientRect().left - svg.getBoundingClientRect().left,
        y: () => navLogo.getBoundingClientRect().top - svg.getBoundingClientRect().top,
        scale: () => navLogo.getBoundingClientRect().width / svg.getBoundingClientRect().width,
        duration: 1.1, ease: 'expo.inOut'
      }, 2.1)
      .to(intro, { backgroundColor: 'rgba(7,11,20,0)', duration: 0.8, ease: 'power2.out' }, 2.5)
      .set(navLogo, { opacity: 1 }, 3.2)
      .set(svg, { opacity: 0 }, 3.21);
    heroIn(tl, 2.45);

    const ready = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      photoImg && photoImg.decode ? photoImg.decode().catch(() => {}) : Promise.resolve()
    ]);
    Promise.race([ready, new Promise((r) => setTimeout(r, 2000))]).then(() => tl.play());
    $('#introSkip').addEventListener('click', () => tl.progress(1));
  } else {
    if (intro) intro.remove();
    heroPrep();
    heroIn(gsap.timeline({ delay: 0.1 }), 0);
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', self.direction === 1 && y > 480 && !menuOpen);
    }
  });
  $$('.nav__links a').forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', toggleClass: { targets: a, className: 'is-current' } });
  });

  if (reduced) { if (skillsGrid) skillsGrid.classList.add('is-filled'); ScrollTrigger.refresh(); return; }

  // Barres de niveau : elles se remplissent à l'arrivée de la section
  if (skillsGrid) ScrollTrigger.create({ trigger: skillsGrid, start: 'top 80%', onEnter: () => skillsGrid.classList.add('is-filled') });

  /* ---------- Révélations au scroll : fondu court et lent ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 28, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } });
  });
  $$('.sec-label').forEach((el) => {
    gsap.from(el, { opacity: 0, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' } });
  });

  // Illustrations : les traits se dessinent quand elles entrent à l'écran
  $$('svg.ill').forEach((svg) => {
    const strokes = $$('.draw:not(.dash)', svg);
    const extras = $$('.dash, text', svg);
    gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(extras, { opacity: 0 });
    const big = strokes.length > 12;
    gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 85%', toggleActions: 'play none none none' } })
      .to(strokes, { strokeDashoffset: 0, duration: big ? 1.8 : 1.2, ease: 'power2.inOut', stagger: big ? 0.035 : 0.12 })
      .to(extras, { opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.08 }, '-=0.8')
      .add(() => gsap.set(strokes, { clearProps: 'strokeDasharray,strokeDashoffset' }));
  });

  // Aperçus des projets : rideau qui s'ouvre
  $$('.mock').forEach((m) => {
    gsap.fromTo(m, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath', scrollTrigger: { trigger: m, start: 'top 85%', toggleActions: 'play none none none' } });
  });

  // Parcours : la ligne se trace, l'étape au centre s'éclaire
  const tlLine = $('.tl-line span');
  if (tlLine) {
    gsap.to(tlLine, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 65%', scrub: 0.6 } });
    $$('.step').forEach((s) => {
      ScrollTrigger.create({ trigger: s, start: 'top 65%', end: 'bottom 65%', toggleClass: 'is-active' });
      gsap.from(s, { opacity: 0, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: s, start: 'top 90%', toggleActions: 'play none none none' } });
    });
  }

  let rfT;
  const safeRefresh = () => { clearTimeout(rfT); rfT = setTimeout(() => { try { ScrollTrigger.refresh(); } catch (e) { /* refresh pendant une restauration de scroll */ } }, 120); };
  if (document.fonts) document.fonts.ready.then(safeRefresh);
  window.addEventListener('load', safeRefresh);
})();
