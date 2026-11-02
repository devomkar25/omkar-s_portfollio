(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Portrait fallback if omkar.jpeg is missing ---------- */
  const portrait = $('.portrait');
  const img = $('#portraitImg');
  if (img) {
    const fail = () => portrait.classList.add('no-img');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  }

  /* ---------- Year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const burger = $('#burger');
  const links = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  /* ---------- Scroll progress + active link ---------- */
  const bar = $('.progress');
  const sections = $$('main section[id]');
  const navAs = $$('#navLinks a[href^="#"]');
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
    let current = sections[0].id;
    sections.forEach(s => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id; });
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Cursor glow ---------- */
  const glow = $('.cursor-glow');
  if (matchMedia('(pointer:fine)').matches) {
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      glow.style.left = x + 'px'; glow.style.top = y + 'px';
      requestAnimationFrame(loop);
    })();
  } else glow.style.display = 'none';

  /* ---------- Typed text ---------- */
  const words = ['smart digital products.', 'clean, fast websites.', 'delightful interfaces.', 'ideas into reality.'];
  const typed = $('#typed');
  let w = 0, c = 0, del = false;
  (function type() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1600); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 35 : 70);
  })();

  /* ---------- Reveal + counters ---------- */
  const countUp = el => {
    const target = +el.dataset.count, dur = 1400, t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 90 + 'ms';
    io.observe(el);
  });

  /* ---------- 3D tilt on portrait ---------- */
  const tilt = $('.tilt');
  if (tilt && matchMedia('(pointer:fine)').matches) {
    tilt.addEventListener('mousemove', e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    tilt.addEventListener('mouseleave', () => (tilt.style.transform = ''));
  }

  /* ---------- Project slider ---------- */
  const track = $('#track');
  const slides = $$('.project', track);
  const cur = $('#curSlide');
  const pad = n => String(n).padStart(2, '0');
  $('#totSlide').textContent = pad(slides.length);
  let idx = 0, auto;
  const go = i => {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    cur.textContent = pad(idx + 1);
  };
  const restart = () => { clearInterval(auto); auto = setInterval(() => go(idx + 1), 6000); };
  $('#next').addEventListener('click', () => { go(idx + 1); restart(); });
  $('#prev').addEventListener('click', () => { go(idx - 1); restart(); });
  let sx = 0;
  track.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
  });
  restart();

  /* ---------- Accordion ---------- */
  $$('.acc-item').forEach(item => {
    $('.acc-head', item).addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.acc-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });

  /* ---------- Copy email ---------- */
  const copyBtn = $('#copyEmail');
  copyBtn.addEventListener('click', async () => {
    const text = $('#emailText').textContent;
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    }
    copyBtn.textContent = '✓';
    setTimeout(() => (copyBtn.textContent = '⧉'), 1800);
  });

  /* ---------- Contact form (opens the visitor's mail app) ---------- */
  const form = $('#contactForm');
  const note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();
    let ok = true;
    [form.name, form.email].forEach(f => f.classList.remove('invalid'));
    if (!name) { form.name.classList.add('invalid'); ok = false; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { form.email.classList.add('invalid'); ok = false; }
    note.classList.toggle('error', !ok);
    if (!ok) { note.textContent = 'Please enter your name and a valid email.'; return; }
    const to = $('#emailText').textContent;
    const subject = encodeURIComponent('Portfolio enquiry from ' + name);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    note.textContent = 'Thanks! Your email app should open with the message ready to send.';
    form.reset();
  });
})();