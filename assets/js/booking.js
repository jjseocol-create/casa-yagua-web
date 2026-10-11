/* Casa Yagua — direct booking engine (front-end)
 * Prices, discount and Airbnb links live in CONFIG. Availability is simulated
 * until the real booking engine (channel manager / PMS) is connected: replace
 * getBookedNights() with the engine's availability feed and submitBooking()
 * with its checkout.
 */
(function () {
  'use strict';

  var CONFIG = {
    discount: 0.10,          // direct price = Airbnb price - 10%
    demo: true,              // shows "preview" notes; set to false with the real engine
    apartments: {
      terrace: { airbnb: 170, img: 'rooftop-terrace.jpg', airbnbUrl: 'https://www.airbnb.com/' },
      beach:   { airbnb: 90,  img: 'beach-studio-bedroom.jpg', airbnbUrl: 'https://www.airbnb.com/' },
      garden:  { airbnb: 80,  img: 'garden-studio-kitchenette.jpg', airbnbUrl: 'https://www.airbnb.com/' }
    },
    order: ['terrace', 'beach', 'garden'],
    maxGuests: 8
  };

  var lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  var T = {
    en: {
      names: { terrace: 'Terrace Apartment', beach: 'Beach Studio', garden: 'Garden Studio' },
      titles: ['Choose your stay', 'Your details', 'Payment', 'Booking confirmed'],
      steps: ['Stay', 'Details', 'Payment'],
      directNote: 'Direct price: 10% less than on Airbnb',
      apartment: 'Apartment', dates: 'Dates', guests: 'Guests', guestsHint: 'Adults and children',
      perNight: '/ night', available: 'Available', booked: 'Booked',
      legendSel: 'Your stay', legendBooked: 'Booked',
      prevMonth: 'Previous month', nextMonth: 'Next month',
      pickCheckin: 'Select your check-in date', pickCheckout: 'Now select your check-out date',
      rangeBlocked: 'Some nights in that range are already booked. Pick other dates.',
      pickApt: 'Choose an apartment to continue',
      nights: function (n) { return n + (n === 1 ? ' night' : ' nights'); },
      guestsN: function (n) { return n + (n === 1 ? ' guest' : ' guests'); },
      fromNight: function (p) { return 'From ' + p + ' / night'; },
      onAirbnb: 'On Airbnb', direct: 'Direct booking discount (10%)', total: 'Total',
      youSave: function (p) { return 'You save ' + p + ' vs Airbnb'; },
      cont: 'Continue', toPay: 'Continue to payment', pay: function (p) { return 'Confirm and pay ' + p; },
      processing: 'Processing…', backToSite: 'Back to the site', back: 'Back', close: 'Close booking',
      name: 'Full name', email: 'Email', phone: 'Phone / WhatsApp', arrival: 'Estimated arrival',
      arrivalOpts: ['Not sure yet', 'Morning', 'Afternoon', 'Evening', 'Late night'],
      message: 'Anything we should know? (optional)', required: 'Please fill in your name and a valid email.',
      payTitle: 'Secure card payment', payText: 'Card details are entered in the booking engine\'s encrypted checkout. Your card is charged when you confirm.',
      terms: 'I accept the house rules and the cancellation policy.',
      termsNeeded: 'Please accept the house rules and cancellation policy.',
      doneTitle: 'You\'re booked!', doneText: function (email) { return 'Your confirmation is on its way to ' + email + '. See you in Cabarete.'; },
      demo: 'Preview: no booking is created and no payment is taken.',
      airbnbAlt: 'First stay with us? You can also book this apartment',
      onAirbnbLink: 'on Airbnb', anyApt: 'Any apartment'
    },
    es: {
      names: { terrace: 'Apartamento Terraza', beach: 'Estudio Playa', garden: 'Estudio Jardín' },
      titles: ['Elige tu estancia', 'Tus datos', 'Pago', 'Reserva confirmada'],
      steps: ['Estancia', 'Datos', 'Pago'],
      directNote: 'Precio directo: 10 % menos que en Airbnb',
      apartment: 'Apartamento', dates: 'Fechas', guests: 'Huéspedes', guestsHint: 'Adultos y niños',
      perNight: '/ noche', available: 'Disponible', booked: 'Ocupado',
      legendSel: 'Tu estancia', legendBooked: 'Ocupado',
      prevMonth: 'Mes anterior', nextMonth: 'Mes siguiente',
      pickCheckin: 'Elige tu fecha de llegada', pickCheckout: 'Ahora elige tu fecha de salida',
      rangeBlocked: 'Algunas noches de ese rango ya están ocupadas. Elige otras fechas.',
      pickApt: 'Elige un apartamento para continuar',
      nights: function (n) { return n + (n === 1 ? ' noche' : ' noches'); },
      guestsN: function (n) { return n + (n === 1 ? ' huésped' : ' huéspedes'); },
      fromNight: function (p) { return 'Desde ' + p + ' / noche'; },
      onAirbnb: 'En Airbnb', direct: 'Descuento por reserva directa (10 %)', total: 'Total',
      youSave: function (p) { return 'Ahorras ' + p + ' frente a Airbnb'; },
      cont: 'Continuar', toPay: 'Continuar al pago', pay: function (p) { return 'Confirmar y pagar ' + p; },
      processing: 'Procesando…', backToSite: 'Volver a la web', back: 'Atrás', close: 'Cerrar reserva',
      name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono / WhatsApp', arrival: 'Hora estimada de llegada',
      arrivalOpts: ['Aún no sé', 'Mañana', 'Tarde', 'Noche', 'Madrugada'],
      message: '¿Algo que debamos saber? (opcional)', required: 'Escribe tu nombre y un correo válido.',
      payTitle: 'Pago seguro con tarjeta', payText: 'Los datos de la tarjeta se ingresan en el checkout cifrado del motor de reservas. El cobro se hace al confirmar.',
      terms: 'Acepto las normas de la casa y la política de cancelación.',
      termsNeeded: 'Acepta las normas de la casa y la política de cancelación.',
      doneTitle: '¡Reserva confirmada!', doneText: function (email) { return 'Te enviamos la confirmación a ' + email + '. Nos vemos en Cabarete.'; },
      demo: 'Vista previa: no se crea ninguna reserva ni se hace ningún cobro.',
      airbnbAlt: '¿Primera vez con nosotros? También puedes reservar este apartamento',
      onAirbnbLink: 'en Airbnb', anyApt: 'Cualquier apartamento'
    }
  }[lang];

  /* ---------- Helpers ---------- */
  var scriptSrc = (document.currentScript && document.currentScript.src) || '';
  var IMG_BASE = scriptSrc ? scriptSrc.replace(/js\/booking\.js.*$/, 'img/') : 'assets/img/';
  var DAY = 86400000;
  function money(n) { return (lang === 'es' ? 'US$' : '$') + Math.round(n).toLocaleString('en-US'); }
  function directRate(id) { return Math.round(CONFIG.apartments[id].airbnb * (1 - CONFIG.discount)); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function key(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parseKey(s) { if (!s) return null; var p = s.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? null : d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function nightsBetween(a, b) { return Math.round((b - a) / DAY); }
  var fmtDay = new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short' });
  var fmtMonth = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' });
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- Simulated availability (replace with the engine's feed) ---------- */
  var bookedCache = {};
  function getBookedNights(id) {
    if (bookedCache[id]) return bookedCache[id];
    var seed = { terrace: 7, beach: 19, garden: 31 }[id] || 1;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var set = {}, d = addDays(today(), 3 + Math.floor(rnd() * 4)), end = addDays(today(), 400);
    while (d < end) {
      var stay = 2 + Math.floor(rnd() * 4);
      for (var i = 0; i < stay; i++) set[key(addDays(d, i))] = true;
      d = addDays(d, stay + 4 + Math.floor(rnd() * 10));
    }
    bookedCache[id] = set;
    return set;
  }
  function nightBooked(id, d) { return !!getBookedNights(id)[key(d)]; }
  function anyFree(d) { return CONFIG.order.some(function (id) { return !nightBooked(id, d); }); }
  function rangeFree(id, a, b) {
    for (var d = new Date(a); d < b; d = addDays(d, 1)) if (nightBooked(id, d)) return false;
    return true;
  }
  function isNightBlocked(d) { return state.apt ? nightBooked(state.apt, d) : !anyFree(d); }
  function rangeOpen(a, b) {
    if (state.apt) return rangeFree(state.apt, a, b);
    return CONFIG.order.some(function (id) { return rangeFree(id, a, b); });
  }

  /* ---------- Fill prices and Airbnb links on the page ---------- */
  function fillPage() {
    document.querySelectorAll('[data-price]').forEach(function (n) {
      var p = n.getAttribute('data-price').split('.');
      if (!CONFIG.apartments[p[0]]) return;
      n.textContent = money(p[1] === 'airbnb' ? CONFIG.apartments[p[0]].airbnb : directRate(p[0]));
    });
    document.querySelectorAll('[data-calc]').forEach(function (n) {
      var p = n.getAttribute('data-calc').split('.'), id = p[0], nights = +p[2] || 1;
      if (!CONFIG.apartments[id]) return;
      var a = CONFIG.apartments[id].airbnb * nights, dct = directRate(id) * nights;
      n.textContent = money(p[1] === 'airbnb' ? a : p[1] === 'direct' ? dct : a - dct);
    });
    document.querySelectorAll('[data-airbnb]').forEach(function (n) {
      var a = CONFIG.apartments[n.getAttribute('data-airbnb')];
      if (a) { n.href = a.airbnbUrl; n.target = '_blank'; }
    });
  }

  /* ---------- State ---------- */
  var state = { step: 0, apt: '', checkin: null, checkout: null, guests: 2, month: null, guest: {}, trigger: null, code: '' };

  /* ---------- Drawer markup ---------- */
  var arrow = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var root = el('div', { 'class': 'bk', id: 'booking', 'aria-hidden': 'true' });
  root.innerHTML =
    '<div class="bk-overlay" data-close></div>' +
    '<div class="bk-panel" role="dialog" aria-modal="true" aria-labelledby="bk-title">' +
      '<div class="bk-head">' +
        '<div class="bk-top">' +
          '<button class="bk-back" type="button" aria-label="' + T.back + '" hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>' +
          '<h2 class="bk-title" id="bk-title"></h2>' +
          '<button class="bk-close" type="button" aria-label="' + T.close + '" data-close><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '</div>' +
        '<ol class="bk-steps"><li>' + T.steps[0] + '</li><li>' + T.steps[1] + '</li><li>' + T.steps[2] + '</li></ol>' +
        '<p class="bk-direct"><span class="save-pill">−10%</span>' + T.directNote + '</p>' +
      '</div>' +
      '<div class="bk-body">' +
        '<section class="bk-step" data-step="0">' +
          '<div class="bk-block"><p class="bk-label">' + T.apartment + '</p><div class="bk-apts" role="radiogroup" aria-label="' + T.apartment + '"></div></div>' +
          '<div class="bk-block"><p class="bk-label">' + T.dates + '</p><div class="cal">' +
            '<div class="cal-head"><button class="cal-nav" type="button" data-cal="-1" aria-label="' + T.prevMonth + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><b class="cal-month" aria-live="polite"></b><button class="cal-nav" type="button" data-cal="1" aria-label="' + T.nextMonth + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>' +
            '<div class="cal-grid"></div>' +
            '<div class="cal-legend"><span><i></i>' + T.legendSel + '</span><span><i class="booked"></i>' + T.legendBooked + '</span></div>' +
            '<p class="bk-error cal-msg" aria-live="polite"></p>' +
          '</div></div>' +
          '<div class="bk-block"><p class="bk-label">' + T.guests + '</p><div class="stepper"><span>' + T.guestsHint + '</span><div class="stepper-ctrl"><button type="button" data-guests="-1" aria-label="−">−</button><span class="guests-n" aria-live="polite"></span><button type="button" data-guests="1" aria-label="+">+</button></div></div></div>' +
          '<div class="bk-block bk-price-box"></div>' +
          '<p class="bk-alt bk-alt-airbnb"></p>' +
        '</section>' +
        '<section class="bk-step" data-step="1">' +
          '<form class="bk-form" novalidate>' +
            '<label>' + T.name + '<input name="name" autocomplete="name" required></label>' +
            '<div class="row"><label>' + T.email + '<input name="email" type="email" autocomplete="email" required></label>' +
            '<label>' + T.phone + '<input name="phone" type="tel" autocomplete="tel"></label></div>' +
            '<label>' + T.arrival + '<select name="arrival">' + T.arrivalOpts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></label>' +
            '<label>' + T.message + '<textarea name="message" rows="3"></textarea></label>' +
            '<p class="bk-error form-msg" aria-live="polite"></p>' +
          '</form>' +
          '<div class="bk-block bk-summary-box"></div>' +
        '</section>' +
        '<section class="bk-step" data-step="2">' +
          '<div class="bk-summary-box"></div>' +
          '<div class="pay-box"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A4C9C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><p><b>' + T.payTitle + '</b>' + T.payText + '</p></div>' +
          '<label class="check"><input type="checkbox" class="terms"> <span>' + T.terms + '</span></label>' +
          '<p class="bk-error pay-msg" aria-live="polite"></p>' +
          (CONFIG.demo ? '<p class="demo-note">' + T.demo + '</p>' : '') +
        '</section>' +
        '<section class="bk-step" data-step="3">' +
          '<div class="bk-done"><div class="bk-done-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1F7A4A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
          '<h3>' + T.doneTitle + '</h3><p class="done-text"></p><span class="bk-code"></span></div>' +
          '<div class="bk-block bk-summary-box"></div>' +
          (CONFIG.demo ? '<p class="demo-note" style="text-align:center">' + T.demo + '</p>' : '') +
        '</section>' +
      '</div>' +
      '<div class="bk-foot"><div class="bk-foot-total"></div><button class="btn btn--pink bk-next" type="button"></button></div>' +
    '</div>';
  document.body.appendChild(root);

  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return root.querySelectorAll(s); };
  var aptsBox = $('.bk-apts'), grid = $('.cal-grid'), monthLabel = $('.cal-month'), calMsg = $('.cal-msg');
  var nextBtn = $('.bk-next'), footTotal = $('.bk-foot-total'), form = $('.bk-form');

  /* ---------- Apartments list ---------- */
  function renderApts() {
    aptsBox.innerHTML = '';
    CONFIG.order.forEach(function (id) {
      var a = CONFIG.apartments[id];
      var hasRange = state.checkin && state.checkout;
      var free = hasRange ? rangeFree(id, state.checkin, state.checkout) : true;
      var b = el('button', { type: 'button', role: 'radio', 'class': 'bk-apt' + (free ? '' : ' is-unavailable'), 'aria-checked': state.apt === id ? 'true' : 'false', 'data-apt': id });
      if (!free) b.setAttribute('aria-disabled', 'true');
      b.innerHTML = '<img src="' + IMG_BASE + a.img + '" alt="" loading="lazy"><span><span class="bk-apt-name">' + T.names[id] + '</span>' +
        '<span class="bk-apt-price"><b>' + money(directRate(id)) + '</b> ' + T.perNight + ' · <s>' + money(a.airbnb) + '</s></span></span>' +
        (hasRange ? '<span class="bk-apt-status ' + (free ? 'ok' : 'no') + '">' + (free ? T.available : T.booked) + '</span>' : '');
      aptsBox.appendChild(b);
    });
  }
  aptsBox.addEventListener('click', function (e) {
    var b = e.target.closest('.bk-apt');
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    var id = b.getAttribute('data-apt');
    state.apt = state.apt === id ? '' : id;
    if (state.apt && state.checkin && state.checkout && !rangeFree(state.apt, state.checkin, state.checkout)) {
      state.checkout = null; calMsg.textContent = T.rangeBlocked;
    }
    renderStay();
  });

  /* ---------- Calendar ---------- */
  function renderCal() {
    var m = state.month, first = new Date(m.getFullYear(), m.getMonth(), 1);
    var startDow = (first.getDay() + 6) % 7; // Monday first
    var daysIn = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    var t = today();
    monthLabel.textContent = fmtMonth.format(first);
    $('[data-cal="-1"]').disabled = first <= new Date(t.getFullYear(), t.getMonth(), 1);
    var dowFmt = new Intl.DateTimeFormat(lang, { weekday: 'narrow' });
    var html = '';
    for (var i = 0; i < 7; i++) html += '<span class="cal-dow" aria-hidden="true">' + dowFmt.format(new Date(2024, 0, 1 + i)) + '</span>';
    for (i = 0; i < startDow; i++) html += '<span></span>';
    var choosingOut = state.checkin && !state.checkout;
    var limit = null;
    if (choosingOut) { // first blocked night after check-in: last possible check-out
      for (var d0 = new Date(state.checkin); d0 < addDays(state.checkin, 400); d0 = addDays(d0, 1)) {
        if (isNightBlocked(d0)) { limit = d0; break; }
      }
    }
    for (var day = 1; day <= daysIn; day++) {
      var d = new Date(m.getFullYear(), m.getMonth(), day);
      var blocked = isNightBlocked(d), disabled = d < t, cls = 'cal-day';
      if (choosingOut) {
        if (d > state.checkin) { if (limit && d > limit) disabled = true; }
        else if (blocked) disabled = true;
      } else if (blocked) disabled = true;
      if (blocked) cls += ' is-booked';
      if (state.checkin && +d === +state.checkin) cls += ' is-start';
      if (state.checkout && +d === +state.checkout) cls += ' is-end';
      if (state.checkin && state.checkout && d > state.checkin && d < state.checkout) cls += ' in-range';
      html += '<button type="button" class="' + cls + '" data-day="' + key(d) + '"' + (disabled ? ' disabled' : '') + ' aria-label="' + fmtDay.format(d) + '">' + day + '</button>';
    }
    grid.innerHTML = html;
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.cal-day');
    if (!b || b.disabled) return;
    var d = parseKey(b.getAttribute('data-day'));
    calMsg.textContent = '';
    if (!state.checkin || state.checkout || d <= state.checkin) {
      if (isNightBlocked(d)) return;
      state.checkin = d; state.checkout = null;
      calMsg.textContent = T.pickCheckout;
    } else if (rangeOpen(state.checkin, d)) {
      state.checkout = d;
      if (state.apt && !rangeFree(state.apt, state.checkin, d)) state.apt = '';
    } else {
      calMsg.textContent = T.rangeBlocked;
    }
    renderStay();
  });
  $$('[data-cal]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() + +b.getAttribute('data-cal'), 1);
      renderCal();
    });
  });

  /* ---------- Guests ---------- */
  $$('[data-guests]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.guests = Math.min(CONFIG.maxGuests, Math.max(1, state.guests + +b.getAttribute('data-guests')));
      renderGuests();
    });
  });
  function renderGuests() {
    $('.guests-n').textContent = state.guests;
    $('[data-guests="-1"]').disabled = state.guests <= 1;
    $('[data-guests="1"]').disabled = state.guests >= CONFIG.maxGuests;
  }

  /* ---------- Prices ---------- */
  function quote() {
    if (!state.apt || !state.checkin || !state.checkout) return null;
    var n = nightsBetween(state.checkin, state.checkout);
    var air = CONFIG.apartments[state.apt].airbnb * n, dct = directRate(state.apt) * n;
    return { nights: n, airbnb: air, direct: dct, save: air - dct };
  }
  function priceLines(q) {
    return '<div class="bk-line"><span>' + T.onAirbnb + ' · ' + T.nights(q.nights) + ' × ' + money(CONFIG.apartments[state.apt].airbnb) + '</span><s>' + money(q.airbnb) + '</s></div>' +
      '<div class="bk-line save"><span>' + T.direct + '</span><span>−' + money(q.save) + '</span></div>' +
      '<div class="bk-line total"><span>' + T.total + '</span><span>' + money(q.direct) + '</span></div>';
  }
  function summaryHTML() {
    var q = quote(); if (!q) return '';
    return '<div class="bk-summary"><div class="bk-summary-head"><img src="' + IMG_BASE + CONFIG.apartments[state.apt].img + '" alt="">' +
      '<div><b>' + T.names[state.apt] + '</b><span>' + fmtDay.format(state.checkin) + ' → ' + fmtDay.format(state.checkout) + ' · ' + T.guestsN(state.guests) + '</span></div></div>' +
      priceLines(q) + '</div>';
  }

  /* ---------- Render ---------- */
  function renderStay() {
    renderApts(); renderCal(); renderGuests();
    var q = quote();
    $('.bk-price-box').innerHTML = q ? '<div class="bk-summary">' + priceLines(q) + '</div>' : '';
    if (!state.checkin && !calMsg.textContent) calMsg.textContent = T.pickCheckin;
    if (state.checkin && state.checkout && !state.apt) calMsg.textContent = T.pickApt;
    else if (state.checkin && state.checkout && calMsg.textContent === T.pickApt) calMsg.textContent = '';
    var alt = $('.bk-alt-airbnb');
    if (state.apt) alt.innerHTML = T.airbnbAlt + ' <a href="' + esc(CONFIG.apartments[state.apt].airbnbUrl) + '" target="_blank" rel="noopener">' + T.onAirbnbLink + '</a>.';
    else alt.innerHTML = '';
    renderFoot();
  }
  function renderFoot() {
    var q = quote();
    if (state.step === 3) {
      footTotal.innerHTML = '';
      nextBtn.textContent = T.backToSite; nextBtn.disabled = false; return;
    }
    if (q) footTotal.innerHTML = T.total + ' · ' + T.nights(q.nights) + '<b>' + money(q.direct) + '</b><span class="saving">' + T.youSave(money(q.save)) + '</span>';
    else {
      var min = Math.min.apply(null, CONFIG.order.map(directRate));
      footTotal.innerHTML = '<b>' + T.fromNight(money(state.apt ? directRate(state.apt) : min)) + '</b>' + T.directNote;
    }
    if (state.step === 0) {
      nextBtn.innerHTML = T.cont + ' ' + arrow;
      nextBtn.disabled = !q;
    } else if (state.step === 1) {
      nextBtn.innerHTML = T.toPay + ' ' + arrow; nextBtn.disabled = false;
    } else if (state.step === 2) {
      nextBtn.innerHTML = T.pay(money(q.direct)); nextBtn.disabled = false;
    }
  }
  function go(step) {
    state.step = step;
    $$('.bk-step').forEach(function (s) { s.classList.toggle('is-active', +s.getAttribute('data-step') === step); });
    $$('.bk-steps li').forEach(function (li, i) {
      li.classList.toggle('is-current', i === step);
      li.classList.toggle('is-done', i < step);
    });
    $('#bk-title').textContent = T.titles[step];
    $('.bk-back').hidden = !(step === 1 || step === 2);
    $('.bk-steps').style.display = step === 3 ? 'none' : '';
    $('.bk-direct').style.display = step === 3 ? 'none' : '';
    if (step > 0) $$('.bk-summary-box').forEach(function (b) { b.innerHTML = summaryHTML(); });
    if (step === 0) renderStay(); else renderFoot();
    $('.bk-body').scrollTop = 0;
  }

  nextBtn.addEventListener('click', function () {
    if (state.step === 0 && quote()) go(1);
    else if (state.step === 1) {
      var F = form.elements, name = F['name'].value.trim(), email = F['email'].value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      F['name'].classList.toggle('is-invalid', !name);
      F['email'].classList.toggle('is-invalid', !okEmail);
      if (!name || !okEmail) { $('.form-msg').textContent = T.required; return; }
      $('.form-msg').textContent = '';
      state.guest = { name: name, email: email, phone: F['phone'].value.trim(), arrival: F['arrival'].value, message: F['message'].value.trim() };
      go(2);
    } else if (state.step === 2) {
      if (!$('.terms').checked) { $('.pay-msg').textContent = T.termsNeeded; return; }
      $('.pay-msg').textContent = '';
      nextBtn.disabled = true; nextBtn.textContent = T.processing;
      submitBooking(function (code) {
        state.code = code;
        $('.done-text').textContent = T.doneText(state.guest.email);
        $('.bk-code').textContent = code;
        go(3);
      });
    } else if (state.step === 3) close();
  });
  $('.bk-back').addEventListener('click', function () { if (state.step > 0) go(state.step - 1); });
  $('.terms').addEventListener('change', function () { if (this.checked) $('.pay-msg').textContent = ''; });

  // Replace with the booking engine's checkout call.
  function submitBooking(done) {
    setTimeout(function () { done('CY-' + Math.floor(10000 + Math.random() * 89999)); }, 1100);
  }

  /* ---------- Open / close ---------- */
  function open(opts) {
    opts = opts || {};
    if (state.step === 3) { // start a fresh booking after a confirmed one
      state.step = 0; state.checkin = null; state.checkout = null; form.reset(); $('.terms').checked = false;
    }
    if (opts.apt !== undefined) state.apt = opts.apt;
    if (opts.guests) state.guests = Math.min(CONFIG.maxGuests, Math.max(1, opts.guests));
    if (opts.checkin) {
      var ci = opts.checkin, co = opts.checkout;
      if (ci >= today() && !isNightBlocked(ci)) {
        state.checkin = ci; state.checkout = null;
        if (co && co > ci && rangeOpen(ci, co)) state.checkout = co;
        calMsg.textContent = state.checkout ? '' : (co ? T.rangeBlocked : T.pickCheckout);
      } else { calMsg.textContent = T.rangeBlocked; }
    }
    if (state.apt && state.checkin && state.checkout && !rangeFree(state.apt, state.checkin, state.checkout)) state.apt = '';
    var base = state.checkin || today();
    state.month = new Date(base.getFullYear(), base.getMonth(), 1);
    state.trigger = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    go(0);
    setTimeout(function () { $('.bk-close').focus(); }, 60);
  }
  function close() {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (state.trigger && state.trigger.focus) state.trigger.focus();
  }
  root.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', function (e) {
    if (!root.classList.contains('is-open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // keep focus inside the dialog
      var f = Array.prototype.filter.call(root.querySelectorAll('button, [href], input, select, textarea'), function (n) {
        return !n.disabled && n.offsetParent !== null && !n.hidden;
      });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Triggers ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-book]');
    if (!t) return;
    e.preventDefault();
    var id = t.getAttribute('data-book');
    open({ apt: CONFIG.apartments[id] ? id : (id === '' ? state.apt : '') });
  });

  var bar = document.getElementById('bookbar');
  if (bar) {
    var inEl = bar.querySelector('[name="checkin"]'), outEl = bar.querySelector('[name="checkout"]');
    var t0 = key(today());
    inEl.min = t0; outEl.min = key(addDays(today(), 1));
    inEl.addEventListener('change', function () {
      var ci = parseKey(inEl.value);
      if (ci) {
        outEl.min = key(addDays(ci, 1));
        if (!outEl.value || parseKey(outEl.value) <= ci) outEl.value = key(addDays(ci, 3));
      }
    });
    bar.addEventListener('submit', function (e) {
      e.preventDefault();
      var apt = bar.querySelector('[name="apartment"]').value;
      open({
        apt: apt,
        checkin: parseKey(inEl.value),
        checkout: parseKey(outEl.value),
        guests: +bar.querySelector('[name="guests"]').value
      });
    });
  }

  fillPage();
  window.CasaYaguaBooking = { open: open, config: CONFIG };
})();
