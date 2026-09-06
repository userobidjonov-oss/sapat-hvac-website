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
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      const label = themeToggle.querySelector('.theme-toggle__text');
      if (label) label.textContent = isLight ? 'Dark' : 'Light';
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
      setError('fullName', 'Please enter your full name.');
      isValid = false;
    } else {
      clearError('fullName');
    }

    if (!phone || !phone.value.trim() || !/^\+?[0-9\s()-]{7,}$/.test(phone.value.trim())) {
      setError('phone', 'Please enter a valid phone number.');
      isValid = false;
    } else {
      clearError('phone');
    }

    if (!email || !email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError('email', 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError('email');
    }

    if (!message || !message.value.trim() || message.value.trim().length < 10) {
      setError('message', 'Please share a few details about your project.');
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

    submitBtn?.setAttribute('disabled', 'disabled');
    const btnLabel = submitBtn?.querySelector('.btn-label');
    const btnLoading = submitBtn?.querySelector('.btn-loading');

    if (btnLabel) btnLabel.hidden = true;
    if (btnLoading) btnLoading.hidden = false;

    window.setTimeout(() => {
      form.reset();
      formSuccess?.removeAttribute('hidden');
      if (btnLabel) btnLabel.hidden = false;
      if (btnLoading) btnLoading.hidden = true;
      submitBtn?.removeAttribute('disabled');
    }, 900);
  });

  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
});
