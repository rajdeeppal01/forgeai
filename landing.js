// =============================================
// ForgeAI — Landing Page JS
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

  // ── Fade-up Intersection Observer ─────────
  const fadeEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));

  // ── Animated Counters ─────────────────────
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const isDecimal = String(target).includes('.');
    const duration = 1800;
    const start = performance.now();
    const startVal = 0;
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const val = startVal + (target - startVal) * eased;
      el.textContent = isDecimal
        ? val.toFixed(1)
        : Math.round(val).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    statObserver.observe(el);
  });

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

  // ── Coded Demo Animation ──────────────────
  const typeText = "Generate a Go-to-Market Strategy for a B2B SaaS";
  const typeTarget = document.getElementById('typewriterText');
  const aiMsg = document.getElementById('aiResponse');
  const aiDots = aiMsg?.querySelector('.typing-dots');
  const aiContent = aiMsg?.querySelector('.ai-content');
  
  if (typeTarget && aiMsg) {
    let charIndex = 0;
    
    function startDemo() {
      // Reset
      typeTarget.textContent = '';
      aiMsg.style.opacity = '0';
      aiDots.style.display = 'flex';
      aiContent.style.display = 'none';
      charIndex = 0;
      
      setTimeout(typeWriter, 1000);
    }
    
    function typeWriter() {
      if (charIndex < typeText.length) {
        typeTarget.textContent += typeText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, Math.random() * 50 + 30);
      } else {
        setTimeout(showAIResponse, 600);
      }
    }
    
    function showAIResponse() {
      aiMsg.style.opacity = '1';
      setTimeout(() => {
        aiDots.style.display = 'none';
        aiContent.style.display = 'block';
        setTimeout(startDemo, 5000); // Loop the demo
      }, 1500);
    }
    
    // Start on Intersection to ensure it's visible
    const demoObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startDemo();
        demoObserver.disconnect();
      }
    }, { threshold: 0.5 });
    
    demoObserver.observe(document.querySelector('.coded-demo'));
  }
});
