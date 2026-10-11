/* Casa Yagua — header, menu and scroll animations */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('site-header');
  var menu = document.getElementById('mobile-menu');
  var toggle = document.querySelector('.menu-toggle');
  var mobileBook = document.getElementById('mobile-book');
  var hero = document.querySelector('.hero');
  var heroImg = document.querySelector('.hero-media img');
  var isEs = root.lang === 'es';

  /* ---------- Header: transparent on top, solid after, hides on scroll down ---------- */
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var menuOpen = menu && menu.classList.contains('is-open');
    header.classList.toggle('is-solid', y > 40);
    if (!menuOpen) {
      if (y > lastY && y > 320) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 320) header.classList.remove('is-hidden');
    }
    if (heroImg && !reduceMotion && hero && y < hero.offsetHeight) {
      heroImg.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  // Reveal the header when keyboard focus lands in it
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? (isEs ? 'Cerrar menú' : 'Close menu') : (isEs ? 'Abrir menú' : 'Open menu'));
    document.body.classList.toggle('is-locked', open);
    header.classList.remove('is-hidden');
    header.classList.toggle('is-solid', open || window.scrollY > 40);
  }
  if (toggle) toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180 && menu && menu.classList.contains('is-open')) setMenu(false); });

  /* ---------- Scroll reveals ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    root.classList.add('reveal-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) map[s.id] = a; });
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('is-current'); });
          link.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { navIo.observe(document.getElementById(id)); });
  }

  /* ---------- Sticky booking bar on mobile ---------- */
  if (mobileBook && hero && 'IntersectionObserver' in window) {
    var footer = document.querySelector('.footer');
    var heroVisible = true, footerVisible = false;
    function updateBar() { mobileBook.classList.toggle('is-visible', !heroVisible && !footerVisible); }
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; updateBar(); }, { threshold: 0.05 }).observe(hero);
    if (footer) new IntersectionObserver(function (e) { footerVisible = e[0].isIntersecting; updateBar(); }).observe(footer);
  }
})();
