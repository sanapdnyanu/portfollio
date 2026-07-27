  document.getElementById('year').textContent = new Date().getFullYear();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Active tab highlighting on scroll ----------
  const tabs = document.querySelectorAll('.tab');
  const sections = [...tabs].map(t => document.getElementById(t.dataset.target));

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        tabs.forEach(t => t.classList.toggle('active', t.dataset.target === id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => s && navObserver.observe(s));

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(tab.dataset.target);
      if(target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // ---------- Scroll progress bar ----------
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    progressBar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- Back to top ----------
  const toTopBtn = document.getElementById('toTop');
  document.addEventListener('scroll', () => {
    toTopBtn.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });
  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const stagger = el.dataset.index ? (el.dataset.index - 1) * 120 : 0;
        setTimeout(() => el.classList.add('in'), stagger);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Section titles fade in too ----------
  document.querySelectorAll('.section-title, .section-sub, .line-label').forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.section-title, .section-sub, .line-label').forEach(el => revealObserver.observe(el));

  // ---------- Spotlight / tilt on project cards ----------
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if(reduceMotion) return;
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      const rx = ((y / r.height) - 0.5) * -6;
      const ry = ((x / r.width) - 0.5) * 6;
      card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
  });

  // ---------- Spotlight on terminal ----------
  const terminalEl = document.querySelector('.terminal');
  if(terminalEl && !reduceMotion){
    terminalEl.addEventListener('mousemove', (e) => {
      const r = terminalEl.getBoundingClientRect();
      terminalEl.style.setProperty('--tx', (e.clientX - r.left) + 'px');
      terminalEl.style.setProperty('--ty', (e.clientY - r.top) + 'px');
    });
  }

  // ---------- Terminal typewriter ----------
  const termBody = document.getElementById('terminalBody');
  const originalLines = [...termBody.children].map(el => el.outerHTML);
  termBody.innerHTML = '';

  async function runTerminal(){
    for(let i = 0; i < originalLines.length; i++){
      const wrapper = document.createElement('div');
      wrapper.style.opacity = '0';
      termBody.appendChild(wrapper);

      if(reduceMotion){
        wrapper.innerHTML = originalLines[i];
        wrapper.style.opacity = '1';
        continue;
      }

      await new Promise(resolve => {
        wrapper.style.transition = 'opacity .3s ease';
        wrapper.innerHTML = originalLines[i];
        requestAnimationFrame(() => { wrapper.style.opacity = '1'; });
        setTimeout(resolve, 260);
      });
    }
  }
  runTerminal();

  // ---------- Copy-to-clipboard on contact links ----------
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  document.querySelectorAll('.contact-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const valueEl = link.querySelector('.v');
      if(!valueEl || !navigator.clipboard) return;
      navigator.clipboard.writeText(valueEl.textContent.trim())
        .then(() => showToast('Copied: ' + valueEl.textContent.trim()))
        .catch(() => {});
    });
  });
