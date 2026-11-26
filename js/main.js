/* i18n helper: pages in /ar/ and /ru/ define window.I18N (built by tools/i18n_build.py). */
const T = (text) => (window.I18N && window.I18N[text]) || text;

/* Localised WhatsApp greeting on quick-contact links. */
document.addEventListener('DOMContentLoaded', () => {
  const greeting = T('Hello Sapat, I would like a quote.');
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((a) => {
    a.href = a.href.split('?')[0] + '?text=' + encodeURIComponent(greeting);
  });
  const lang = document.documentElement.lang || 'en';
  document.querySelectorAll('.lang-switch a[data-lang]').forEach((a) => {
    if (a.dataset.lang === lang) a.setAttribute('aria-current', 'true');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
  const themeToggle = document.getElementById('themeToggle');

  const setTheme = (theme) => {
    const isLight = theme === 'light';
    body.classList.toggle('light-mode', isLight);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? T('Switch to dark mode') : T('Switch to light mode'));
      const label = themeToggle.querySelector('.theme-toggle__text');
      if (label) label.textContent = isLight ? T('Dark') : T('Light');
    }
    window.localStorage.setItem('sapat-theme', isLight ? 'light' : 'dark');
  };

  const savedTheme = window.localStorage.getItem('sapat-theme');
  setTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggle?.addEventListener('click', () => {
    setTheme(body.classList.contains('light-mode') ? 'dark' : 'light');
  });

  const setNavbarState = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  const setMobileMenuState = (open) => {
    if (!mobileToggle || !mobileMenu || !mobileOverlay) return;

    const isOpen = Boolean(open);
    mobileToggle.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    mobileOverlay.classList.toggle('open', isOpen);
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    mobileOverlay.setAttribute('aria-hidden', String(!isOpen));
    mobileMenu.inert = !isOpen;
    body.classList.toggle('menu-open', isOpen);
    body.style.overflow = isOpen ? 'hidden' : '';

    if (isOpen) {
      mobileMenu.querySelector('.mobile-link')?.focus();
    } else {
      mobileToggle.focus();
    }
  };

  const updateActiveNav = () => {
    const sections = navLinks
      .map((link) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return null;
        const section = document.querySelector(targetId);
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const viewportTop = window.scrollY + 160;
    let activeId = '';

    for (const { section } of sections) {
      if (section.offsetTop <= viewportTop) {
        activeId = section.id;
      }
    }

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active', isActive);
    });
  };

  setNavbarState();
  updateActiveNav();

  window.addEventListener('scroll', () => {
    setNavbarState();
    updateActiveNav();
  }, { passive: true });

  mobileToggle?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    setMobileMenuState(!isOpen);
  });

  mobileOverlay?.addEventListener('click', () => setMobileMenuState(false));

  [...navLinks, ...mobileLinks].forEach((link) => {
    link.addEventListener('click', () => setMobileMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      setMobileMenuState(false);
    }
  });

  const revealItems = Array.from(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const faqButtons = Array.from(document.querySelectorAll('.faq__question'));

  faqButtons.forEach((button) => {
    const answer = button.nextElementSibling;
    if (!answer) return;

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      faqButtons.forEach((btn) => {
        const currentAnswer = btn.nextElementSibling;
        btn.setAttribute('aria-expanded', 'false');
        if (currentAnswer) {
          currentAnswer.classList.remove('is-open');
        }
      });

      if (!isExpanded) {
        button.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
      }
    });
  });

  const firstFaq = faqButtons[0];
  if (firstFaq) {
    firstFaq.setAttribute('aria-expanded', 'true');
    const firstAnswer = firstFaq.nextElementSibling;
    if (firstAnswer) {
      firstAnswer.classList.add('is-open');
    }
  }

  const counters = Array.from(document.querySelectorAll('.stat-num'));

  const animateCounter = (element) => {
    const target = Number(element.dataset.target || 0);
    const suffix = element.dataset.suffix || '';
    const startTime = window.performance.now();
    const duration = 1800;

    const tick = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * eased);
      element.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.textContent = `${target}${suffix}`;
      }
    };

    window.requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => animateCounter(counter));
  }

  const form = document.querySelector('.contact-form');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');
  const formFields = [
    { id: 'fullName', message: 'Please enter your full name.' },
    { id: 'phone', message: 'Please enter a valid phone number.' },
    { id: 'email', message: 'Please enter a valid email address.' },
    { id: 'message', message: 'Please share a few details about your project.' }
  ];

  const setError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-err`);
    if (!field || !error) return;

    field.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    error.textContent = message;
  };

  const clearError = (fieldId) => {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}-err`);
    if (!field || !error) return;

    field.classList.remove('has-error');
    field.setAttribute('aria-invalid', 'false');
    error.textContent = '';
  };

  formFields.forEach(({ id }) => {
    const field = document.getElementById(id);
    if (!field) return;

    field.addEventListener('input', () => {
      clearError(id);
    });
  });

  const validateForm = () => {
    let isValid = true;

    const name = document.getElementById('fullName');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    if (!name || !name.value.trim() || name.value.trim().length < 2) {
      setError('fullName', T('Please enter your full name.'));
      isValid = false;
    } else {
      clearError('fullName');
    }

    if (!phone || !phone.value.trim() || !/^\+?[0-9\s()-]{7,}$/.test(phone.value.trim())) {
      setError('phone', T('Please enter a valid phone number.'));
      isValid = false;
    } else {
      clearError('phone');
    }

    // Email is optional; validate only when filled in.
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError('email', T('Please enter a valid email address.'));
      isValid = false;
    } else {
      clearError('email');
    }

    if (!message || !message.value.trim() || message.value.trim().length < 10) {
      setError('message', T('Please share a few details about your project.'));
      isValid = false;
    } else {
      clearError('message');
    }

    return isValid;
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // No backend: the request is sent to the company WhatsApp with the form details prefilled.
    const WHATSAPP_NUMBER = '971501357591';
    const value = (id) => (document.getElementById(id)?.value || '').trim();
    const serviceSelect = document.getElementById('service');
    const serviceText = serviceSelect && serviceSelect.value
      ? serviceSelect.options[serviceSelect.selectedIndex].text
      : T('Not specified');

    const lines = [
      T('New request from the website'),
      `${T('Name')}: ${value('fullName')}`,
      `${T('Phone')}: ${value('phone')}`,
      value('email') ? `${T('Email')}: ${value('email')}` : null,
      `${T('Service')}: ${serviceText}`,
      `${T('Message')}: ${value('message')}`
    ].filter(Boolean);

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    const opened = window.open(waUrl, '_blank', 'noopener');
    if (!opened) {
      window.location.href = waUrl;
    }

    formSuccess?.removeAttribute('hidden');
    form.reset();
  });

  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
});

/* ================================================================
   UPDATE 2026-11-24: motion, reels carousel
================================================================ */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* Scroll progress bar */
  const progress = document.querySelector('.scroll-progress');
  /* Subtle hero parallax */
  const heroImg = document.querySelector('.hero__image-wrapper');
  const wide = window.matchMedia('(min-width: 1025px)');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (heroImg && !reduceMotion && wide.matches && window.scrollY < window.innerHeight) {
        heroImg.style.transform = `translateY(${window.scrollY * 0.06}px)`;
      } else if (heroImg && !wide.matches) {
        heroImg.style.transform = '';
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Staggered grids */
  if (!reduceMotion && hasIO) {
    document.documentElement.classList.add('js-motion');
    const groups = document.querySelectorAll(
      '.services__grid, .projects__grid, .why-us__items, .process__timeline, .stats__grid, .trust-strip__list, .about__highlights'
    );
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    groups.forEach((group) => {
      group.setAttribute('data-stagger', '');
      Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
      io.observe(group);
    });
  }

  /* Reels: play muted clips only while visible */
  const videos = Array.from(document.querySelectorAll('video[data-autoplay]'));
  if (reduceMotion || !hasIO) {
    videos.forEach((v) => { v.controls = true; });
  } else {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.preload = 'auto';
          target.play().catch(() => { target.controls = true; });
        } else {
          target.pause();
        }
      });
    }, { threshold: 0.5 });
    videos.forEach((v) => vio.observe(v));
  }

  /* Reels: arrows + progress */
  const track = document.querySelector('.work__track');
  if (track) {
    const arrows = document.querySelectorAll('.work__arrow');
    const bar = document.querySelector('.work__progress-bar');
    const rtl = () => getComputedStyle(track).direction === 'rtl';
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const pos = Math.abs(track.scrollLeft);
      const ratio = max > 0 ? pos / max : 1;
      if (bar) bar.style.transform = `scaleX(${Math.max(0.08, track.clientWidth / track.scrollWidth + ratio * (1 - track.clientWidth / track.scrollWidth))})`;
      arrows.forEach((a) => {
        const dir = Number(a.dataset.dir);
        a.disabled = dir < 0 ? pos <= 2 : pos >= max - 2;
      });
    };
    const phone = window.matchMedia('(max-width: 768px)');
    const reels = Array.from(track.querySelectorAll('.reel'));
    let moving = false; let movingTimer = 0;
    const centredIndex = () => {
      const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = 0; let bestDist = Infinity;
      reels.forEach((r, i) => {
        const b = r.getBoundingClientRect();
        const d = Math.abs(b.left + b.width / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };
    arrows.forEach((a) => a.addEventListener('click', () => {
      if (phone.matches && reels.length) {
        /* Phones: one tap = next/previous card, centred on screen.
           Taps during the short slide animation are ignored so every tap moves exactly one card. */
        if (moving) return;
        const to = Math.min(reels.length - 1, Math.max(0, centredIndex() + Number(a.dataset.dir)));
        const b = reels[to].getBoundingClientRect();
        const t = track.getBoundingClientRect();
        moving = true;
        clearTimeout(movingTimer);
        movingTimer = setTimeout(() => { moving = false; }, reduceMotion ? 0 : 450);
        track.scrollBy({ left: (b.left + b.width / 2) - (t.left + track.clientWidth / 2), behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }
      const card = track.querySelector('.reel');
      const cardW = card ? card.getBoundingClientRect().width + 16 : 280;
      const step = Math.max(cardW, Math.floor(track.clientWidth / cardW) * cardW - cardW);
      track.scrollBy({ left: Number(a.dataset.dir) * step * (rtl() ? -1 : 1), behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
