// ── Toast ─────────────────────────────────────
function showToast(msg, duration = 2800) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Sidebar & Navigation ──────────────────────
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-theme');
    const isDark = document.documentElement.classList.contains('dark-theme');
    LS.set('theme', isDark ? 'dark' : 'light');
  });
}

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
    } else {
      state.sidebarOpen = !state.sidebarOpen;
      appShell.classList.toggle('sidebar-collapsed', !state.sidebarOpen);
    }
  });
}

if (sidebarClose) sidebarClose.addEventListener('click', closeMobileSidebar);

function closeMobileSidebar() {
  if (window.innerWidth <= 900) {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (contextPanel) contextPanel.classList.remove('mobile-open');
  }
}

// ── Context Panel Toggle ──────────────────────
if (contextPanelTgl) {
  contextPanelTgl.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      contextPanel.classList.toggle('mobile-open');
    } else {
      state.contextPanelOpen = !state.contextPanelOpen;
      appShell.classList.toggle('context-collapsed', !state.contextPanelOpen);
    }
  });
}

if (cpClose) {
  cpClose.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      contextPanel.classList.remove('mobile-open');
    } else {
      state.contextPanelOpen = false;
      appShell.classList.add('context-collapsed');
    }
  });
}

// ── Settings ──────────────────────────────────
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    settingsKeyInput.value = state.apiKey ? '••••••••' + state.apiKey.slice(-4) : '';
    settingsOverlay.classList.add('open');
  });
}
if (settingsClose) settingsClose.addEventListener('click', () => settingsOverlay.classList.remove('open'));
if (settingsOverlay) settingsOverlay.addEventListener('click', e => { if (e.target === settingsOverlay) settingsOverlay.classList.remove('open'); });

// ── Guided Tour ──────────────────────────────
function startTour() {
  if (!window.driver) return;
  const driver = window.driver.js.driver;
  const driverObj = driver({
    showProgress: true,
    animate: true,
    steps: [
      { element: '#playbookList', popover: { title: 'Pick a Playbook', description: 'Select a specialized AI agent for your task. Each playbook is tailored with unique instructions.', side: "right", align: 'start' }},
      { element: '#settingsBtn', popover: { title: 'Set Up Your Brain', description: 'Connect your free Google Gemini API key here to power the AI.', side: "right", align: 'end' }},
      { element: '.chat-input-container', popover: { title: 'Chat & Build', description: 'Talk to the AI to draft your content, step-by-step.', side: "top", align: 'center' }},
      { element: '.top-right', popover: { title: 'Export & Tools', description: 'Download your finished work as a PDF or Markdown file, or open the Context panel.', side: "bottom", align: 'end' }}
    ]
  });
  driverObj.drive();
}

if (tourBtn) {
  tourBtn.addEventListener('click', () => {
    startTour();
    LS.set('seen_tour', true);
  });
}

if (updateKeyBtn) {
  updateKeyBtn.addEventListener('click', () => {
    const key = settingsKeyInput.value.trim();
    if (!key || key.startsWith('••••')) { showToast('Enter a new API key to update.'); return; }
    state.apiKey = key;
    LS.set('apiKey', key);
    settingsOverlay.classList.remove('open');
    showToast('✓ API key updated');
  });
}

if (modelSelect) {
  modelSelect.addEventListener('change', () => {
    state.model = modelSelect.value;
    LS.set('model', state.model);
    showToast(`✓ Model switched to ${state.model}`);
  });
}

if (clearAllDataBtn) {
  clearAllDataBtn.addEventListener('click', () => {
    if (!confirm('Delete ALL ForgeAI data? This includes all chats, projects, and settings. This cannot be undone.')) return;
    ['apiKey','model','projects','context','activeProject','msgCount','lastDay','isPro'].forEach(k => LS.remove(k));
    location.reload();
  });
}

// ── Upgrade Banner ────────────────────────────
function showUpgradeBanner() {
  const existing = document.getElementById('upgradeBanner');
  if (existing) return;
  const banner = document.createElement('div');
  banner.id = 'upgradeBanner';
  banner.style.cssText = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #5B21B6, #7C3AED);
    color: white; padding: 16px 24px; border-radius: 16px;
    box-shadow: 0 8px 40px rgba(124,58,237,0.5);
    font-size: 0.88rem; z-index: 500;
    display: flex; align-items: center; gap: 16px;
    animation: modalAppear 0.3s ease;
    max-width: 460px; width: calc(100% - 48px);
  `;
  banner.innerHTML = `
    <span style="font-size:1.2rem"></span>
    <span><strong>Daily limit reached!</strong> Upgrade to Builder for unlimited AI messages.</span>
    <a href="index.html#pricing" style="background:white;color:#7C3AED;padding:8px 16px;border-radius:8px;font-weight:700;font-size:0.82rem;white-space:nowrap;">Upgrade →</a>
    <button onclick="this.parentElement.remove()" style="background:none;color:rgba(255,255,255,0.7);font-size:1.2rem;cursor:pointer;padding:0 4px;">×</button>
  `;
  document.body.appendChild(banner);
}

// ── Responsive Check ──────────────────────────
function checkResponsive() {
  if (window.innerWidth <= 900) {
    if (appShell) appShell.classList.remove('sidebar-collapsed', 'context-collapsed');
  }
}
window.addEventListener('resize', checkResponsive, { passive: true });

// ── Helpers ───────────────────────────────────
function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s) {
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(s));
  return el.innerHTML;
}

// ── Configure marked ──────────────────────────
if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
}
