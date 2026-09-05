// =============================================
// ForgeAI - Landing Page JS
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── Mobile Nav Toggle ─────────────────────
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  navToggle?.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });
  // Close on link click
  navMobile?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMobile.classList.remove('open'));
  });

  // Animations removed per de-vibing rules

  // ── FAQ Accordion ─────────────────────────
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // Close all
      document.querySelectorAll('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });
      // Toggle clicked
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.classList.add('open');
      }
    });
  });

  // ── Pricing Toggle (Monthly / Yearly) ────
  const billingToggle = document.getElementById('billingToggle');
  const toggleMonthly = document.getElementById('toggleMonthly');
  const toggleYearly  = document.getElementById('toggleYearly');
  let isYearly = false;

  billingToggle?.addEventListener('click', () => {
    isYearly = !isYearly;
    billingToggle.classList.toggle('active', isYearly);
    billingToggle.setAttribute('aria-checked', String(isYearly));
    toggleMonthly.classList.toggle('active', !isYearly);
    toggleYearly.classList.toggle('active', isYearly);

    document.querySelectorAll('.price-amount[data-monthly]').forEach(el => {
      const val = isYearly ? el.dataset.yearly : el.dataset.monthly;
      el.textContent = '$' + val;
    });
  });

  toggleMonthly?.addEventListener('click', () => {
    if (isYearly) billingToggle.click();
  });
  toggleYearly?.addEventListener('click', () => {
    if (!isYearly) billingToggle.click();
  });

  // ── Playbook Cards → App ──────────────────
  document.querySelectorAll('.playbook-card').forEach((card, i) => {
    card.addEventListener('click', () => {
      const names = [
        'pitch-deck','gtm-strategy','fundraising',
        'icp-workshop','one-pager','competitor-analysis',
        'business-model-canvas','growth-hacking'
      ];
      window.location.href = `app.html?playbook=${names[i] || 'general'}`;
    });
  });

  // ── Hero CTA pulse on load ────────────────
  setTimeout(() => {
    const cta = document.getElementById('heroCta');
    if (cta) {
      cta.style.animation = 'ctaPulse 2s ease-in-out 3';
    }
  }, 2000);

  // Add keyframe for CTA pulse
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ctaPulse {
      0%,100% { box-shadow: 0 4px 16px rgba(124,58,237,0.35); }
      50%      { box-shadow: 0 8px 40px rgba(124,58,237,0.7); }
    }
  `;
  document.head.appendChild(style);

  // ── Smooth scroll for anchor links ────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Coded Demo Animation removed per de-vibing rules
});
