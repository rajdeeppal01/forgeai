// =============================================
// ForgeAI — App Logic & Gemini Integration
// =============================================

// ── State ─────────────────────────────────────
const state = {
  apiKey: '',
  model: 'gemini-3.5-flash',
  messages: [],         // { role: 'user'|'model', parts: [{text}] }
  activePlaybook: null, // playbook key string
  projects: [],         // [{id, name, messages, playbook}]
  activeProjectId: null,
  context: {},          // startup context object
  isLoading: false,
  sidebarOpen: true,
  contextPanelOpen: true,
  messageCount: 0,      // for daily limit
};

// ── Playbooks Definition ───────────────────────
const PLAYBOOKS = [
  {
    key: 'general',
    icon: '💬',
    name: 'General Chat',
    description: 'Open-ended AI for any startup question',
    system: `You are ForgeAI, an expert AI co-pilot for founders and entrepreneurs. You have deep knowledge of startups, fundraising, product-market fit, growth, marketing, and business strategy. You think like a YC partner — direct, practical, and data-driven. Format your responses with clear structure using markdown. Be concise but thorough. Always give actionable advice.`
  },
  {
    key: 'pitch-deck',
    icon: '',
    name: 'Pitch Deck Builder',
    description: 'VC-grade pitch deck, slide by slide',
    system: `You are a world-class pitch deck consultant who has helped startups raise over $500M in funding from top VCs including a16z, Sequoia, and YC. Your job is to help the founder build a compelling investor pitch deck slide by slide.

Structure: Ask about their startup context first (if not provided). Then work through slides in order: 1) Problem, 2) Solution, 3) Market Size (TAM/SAM/SOM), 4) Product, 5) Business Model, 6) Traction, 7) Go-to-Market, 8) Team, 9) Financials, 10) The Ask.

For each slide: give the recommended content, a strong headline, key bullet points, and what investors look for. Be direct about what's weak and how to fix it.`
  },
  {
    key: 'gtm-strategy',
    icon: '',
    name: 'GTM Strategy',
    description: 'Go-to-market from zero to first 100 customers',
    system: `You are a go-to-market expert who has helped B2B and B2C startups acquire their first 10,000 customers. You specialize in designing lean, high-ROI go-to-market strategies for early-stage startups.

Help the founder build a complete GTM plan including: ICP definition, channel selection, messaging, pricing strategy, sales motion, and 90-day launch plan. Ask for their startup context. Be specific with tactics — not vague "post on social media" but "send 20 cold LinkedIn DMs per day with this exact script...". Think in terms of what works at their current stage, not what Fortune 500 companies do.`
  },
  {
    key: 'fundraising',
    icon: '',
    name: 'Fundraising Prep',
    description: 'Craft your narrative, handle tough investor questions',
    system: `You are a fundraising coach who has helped 50+ startups close seed, Series A, and Series B rounds. You know exactly what VCs look for and how to craft a compelling fundraising narrative.

Help the founder: structure their fundraising story, prepare for tough investor questions, craft the right email outreach, build their target investor list strategy, and handle common objections. Role-play as a tough investor when needed. Be honest — if something is a red flag, say so and suggest how to fix it.`
  },
  {
    key: 'icp-workshop',
    icon: '',
    name: 'ICP Workshop',
    description: 'Define your ideal customer with precision',
    system: `You are a B2B sales and marketing strategist who specializes in Ideal Customer Profile (ICP) development. You've helped dozens of startups go from "we serve everyone" to laser-focused targeting that 10x'd their conversion rates.

Run a structured workshop to help the founder: identify their best-fit customer segments, define firmographic and psychographic criteria, understand the buyer's journey, identify decision-makers vs. influencers, and create a concrete ICP document they can share with their team. Ask questions progressively — don't overwhelm with everything at once.`
  },
  {
    key: 'one-pager',
    icon: '',
    name: 'One-Pager Generator',
    description: 'Crisp executive summary for partners & investors',
    system: `You are an expert at distilling complex startup stories into crisp, compelling one-page executive summaries. These are used for investor outreach, partnership proposals, and PR.

Help the founder create a one-pager that covers: the hook (one-liner), problem, solution, market opportunity, traction, team, and ask — all in a scannable format that takes 60 seconds to read and leaves the reader wanting more. After drafting, help them refine every line until it's sharp and punchy.`
  },
  {
    key: 'competitor-analysis',
    icon: '',
    name: 'Competitor Analysis',
    description: 'Deep-dive your competitive landscape',
    system: `You are a competitive intelligence expert who helps startups understand their market landscape and find their defensible position. You think in terms of Porter's Five Forces, Jobs-to-be-Done, and strategic positioning.

Help the founder: map their competitive landscape (direct, indirect, substitute), identify competitor strengths/weaknesses, find white space opportunities, craft a compelling competitive differentiation narrative, and define their moat. Produce structured tables and frameworks where useful.`
  },
  {
    key: 'business-model-canvas',
    icon: '🗃',
    name: 'Business Model Canvas',
    description: 'Map value props, channels, and revenue streams',
    system: `You are a business model design expert, trained in the Business Model Canvas (Osterwalder), Lean Canvas, and Value Proposition Design methodologies. You've helped 100+ startups pressure-test and refine their business models.

Work through the Lean Canvas with the founder: Problem, Customer Segments, Unique Value Proposition, Solution, Channels, Revenue Streams, Cost Structure, Key Metrics, and Unfair Advantage. For each block, give examples, ask probing questions, and highlight risks. Output a complete canvas summary at the end.`
  },
  {
    key: 'growth-hacking',
    icon: '',
    name: 'Growth Hacking',
    description: 'Highest-leverage growth levers for your stage',
    system: `You are a growth expert who has driven growth at multiple startups from $0 to $10M ARR. You think in AARRR metrics (Acquisition, Activation, Retention, Revenue, Referral) and high-leverage experiments.

Help the founder: audit their current growth metrics, identify the biggest bottleneck, brainstorm high-ROI growth experiments, prioritize by impact vs. effort, and build a 30-day growth sprint plan. Be specific — real tactics with real examples, not generic advice. Think scrappy and founder-led, not agency-driven.`
  },
  {
    key: 'cold-outreach',
    icon: '📧',
    name: 'Cold Outreach',
    description: 'High-converting sales emails & LinkedIn DMs',
    system: `You are a B2B sales expert who has written cold email and LinkedIn outreach sequences that generated millions in pipeline. You specialize in short, punchy, personalized outreach that gets high open and reply rates.

Help the founder craft cold outreach sequences. Focus on: grabbing attention in the first line, keeping it under 100 words, focusing on the prospect's pain point (not the product's features), and using a low-friction call to action. Provide the exact templates and follow-up sequence.`
  }
];

// ── DOM Elements ──────────────────────────────
const $ = id => document.getElementById(id);
const apiKeyModal     = $('apiKeyModal');
const apiKeyInput     = $('apiKeyInput');
const apiKeyError     = $('apiKeyError');
const saveApiKeyBtn   = $('saveApiKey');
const toggleKeyVis    = $('toggleKeyVisibility');
const appShell        = $('appShell');
const chatMessages    = $('chatMessages');
const welcomeScreen   = $('welcomeScreen');
const chatInput       = $('chatInput');
const sendBtn         = $('sendBtn');
const charCount       = $('charCount');
const playbookList    = $('playbookList');
const projectList     = $('projectList');
const welcomePlaybooks= $('welcomePlaybooks');
const newChatBtn      = $('newChatBtn');
const addProjectBtn   = $('addProjectBtn');
const sidebarToggle   = $('sidebarToggle');
const sidebarClose    = $('sidebarClose');
const contextPanelTgl = $('contextPanelToggle');
const cpClose         = $('cpClose');
const contextPanel    = $('contextPanel');
const sidebar         = $('sidebar');
const activePlaybookName = $('activePlaybookName');
const exportPdfBtn    = $('exportPdfBtn');
const exportBtn       = $('exportBtn');
const clearChatBtn    = $('clearChatBtn');
const settingsBtn     = $('settingsBtn');
const settingsOverlay = $('settingsOverlay');
const settingsClose   = $('settingsClose');
const settingsKeyInput= $('settingsKeyInput');
const updateKeyBtn    = $('updateKeyBtn');
const modelSelect     = $('modelSelect');
const clearAllDataBtn = $('clearAllDataBtn');
const changeKeyBtn    = $('changeKeyBtn');
const toast           = $('toast');
// Context Panel
const ctxName    = $('ctxName');
const ctxStage   = $('ctxStage');
const ctxMarket  = $('ctxMarket');
const ctxProblem = $('ctxProblem');
const ctxRevenue = $('ctxRevenue');
const ctxGoal    = $('ctxGoal');
const saveContextBtn = $('saveContextBtn');
const ctxSavedMsg    = $('ctxSavedMsg');

// ── Storage Helpers ───────────────────────────
const LS = {
  get: (k, def = null) => { try { const v = localStorage.getItem(`forgeai_${k}`); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(`forgeai_${k}`, JSON.stringify(v)); } catch {} },
  remove: (k) => { localStorage.removeItem(`forgeai_${k}`); }
};

// ── Toast ─────────────────────────────────────
function showToast(msg, duration = 2800) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Init ──────────────────────────────────────
function init() {
  // Load saved state
  state.apiKey     = LS.get('apiKey', '');
  state.model      = LS.get('model', 'gemini-3.5-flash');
  state.projects   = LS.get('projects', []);
  state.context    = LS.get('context', {});
  state.messageCount = LS.get('msgCount', 0);
  state.activeProjectId = LS.get('activeProject', null);

  // Check URL params for playbook pre-selection or upgrades
  const urlParams = new URLSearchParams(window.location.search);
  const pbParam = urlParams.get('playbook');
  const upgradeParam = urlParams.get('upgrade');

  if (upgradeParam === 'success') {
    LS.set('isPro', true);
    // Remove the param from URL without reloading
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(() => showToast('🎉 Upgrade successful! Welcome to Founder Pro.'), 1000);
  }

  if (!state.apiKey) {
    apiKeyModal.classList.remove('hidden');
    appShell.style.display = 'none';
  } else {
    apiKeyModal.classList.add('hidden');
    appShell.style.display = 'grid';
    loadApp(pbParam);
  }
}

function loadApp(preselectedPlaybook = null) {
  // Restore UI state
  if (modelSelect) modelSelect.value = state.model;

  // Load context form
  loadContextForm();

  // Render sidebar
  renderPlaybookList();
  renderProjectList();
  renderWelcomePlaybooks();

  // Set active playbook
  if (preselectedPlaybook) {
    activatePlaybook(preselectedPlaybook);
  } else if (state.activeProjectId) {
    const proj = state.projects.find(p => p.id === state.activeProjectId);
    if (proj) {
      loadProjectMessages(proj);
    }
  }

  // Responsive sidebar
  checkResponsive();
}

// ── API Key Modal ─────────────────────────────
saveApiKeyBtn?.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) { apiKeyError.textContent = 'Please enter your API key.'; return; }
  
  apiKeyError.textContent = '';
  saveApiKeyBtn.textContent = 'Validating...';
  saveApiKeyBtn.disabled = true;

  const validationResult = await validateApiKey(key);
  if (validationResult.valid) {
    state.apiKey = key;
    LS.set('apiKey', key);
    apiKeyModal.classList.add('hidden');
    appShell.style.display = 'grid';
    loadApp();
  } else {
    apiKeyError.textContent = validationResult.error || 'Invalid API key. Please check and try again.';
    saveApiKeyBtn.textContent = 'Save & Launch ForgeAI →';
    saveApiKeyBtn.disabled = false;
  }
});

apiKeyInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveApiKeyBtn.click();
});

toggleKeyVis?.addEventListener('click', () => {
  apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
});

changeKeyBtn?.addEventListener('click', () => {
  state.apiKey = '';
  LS.remove('apiKey');
  appShell.style.display = 'none';
  apiKeyModal.classList.remove('hidden');
  apiKeyInput.value = '';
  apiKeyError.textContent = '';
  saveApiKeyBtn.textContent = 'Save & Launch ForgeAI →';
  saveApiKeyBtn.disabled = false;
});

async function validateApiKey(key) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Hi' }] }] })
      }
    );
    if (res.ok) return { valid: true };
    
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message || `HTTP ${res.status}`;
    return { valid: false, error: 'Validation failed: ' + msg };
  } catch (err) { 
    return { valid: false, error: 'Network error checking key.' }; 
  }
}

// ── Sidebar Playbook List ─────────────────────
function renderPlaybookList() {
  playbookList.innerHTML = '';
  PLAYBOOKS.forEach(pb => {
    const el = document.createElement('div');
    el.className = `sidebar-item ${state.activePlaybook === pb.key ? 'active' : ''}`;
    el.dataset.key = pb.key;
    el.innerHTML = `<span class="sidebar-item-icon">${pb.icon}</span><span class="sidebar-item-label">${pb.name}</span>`;
    el.addEventListener('click', () => activatePlaybook(pb.key));
    playbookList.appendChild(el);
  });
}

function renderWelcomePlaybooks() {
  welcomePlaybooks.innerHTML = '';
  const featured = PLAYBOOKS.slice(0, 8);
  featured.forEach(pb => {
    const el = document.createElement('div');
    el.className = 'welcome-pb-card';
    el.innerHTML = `
      <div class="pb-em">${pb.icon}</div>
      <div class="pb-title">${pb.name}</div>
      <div class="pb-desc">${pb.description}</div>
    `;
    el.addEventListener('click', () => activatePlaybook(pb.key));
    welcomePlaybooks.appendChild(el);
  });
}

function activatePlaybook(key) {
  const pb = PLAYBOOKS.find(p => p.key === key) || PLAYBOOKS[0];
  state.activePlaybook = pb.key;
  state.messages = [];

  // Update UI
  activePlaybookName.textContent = pb.name;
  renderPlaybookList();

  // Show welcome or reset chat
  chatMessages.innerHTML = '';
  chatMessages.style.display = 'none';
  welcomeScreen.style.display = 'flex';

  // If not general, add a greeting
  if (pb.key !== 'general') {
    const greeting = getPlaybookGreeting(pb);
    state.messages = [];
    setTimeout(() => startPlaybookGreeting(pb, greeting), 100);
  }

  closeMobileSidebar();
}

function getPlaybookGreeting(pb) {
  const ctx = state.context;
  const hasCtx = ctx.name || ctx.problem;
  const ctxNote = hasCtx
    ? `I can see you're building **${ctx.name || 'your startup'}**${ctx.stage ? ` at the ${ctx.stage} stage` : ''}. Great — let's use that context.`
    : `First, a quick tip: fill out your **Startup Context** (right panel) so I can give you tailored advice.`;

  const greetings = {
    'pitch-deck': ` **Pitch Deck Builder activated!**\n\n${ctxNote}\n\nI'm going to help you build a VC-grade pitch deck slide by slide. Let's start with the foundation:\n\n**What problem does your startup solve, and for whom?** (Don't overthink it — just tell me like you're talking to a friend.)`,
    'gtm-strategy': ` **GTM Strategy activated!**\n\n${ctxNote}\n\nLet's build your go-to-market strategy from the ground up.\n\n**Quick question to start:** Are you targeting B2B or B2C, and what stage are you at — pre-launch, just launched, or have some customers already?`,
    'fundraising': ` **Fundraising Prep activated!**\n\nI'm your fundraising coach. I'll help you craft a compelling narrative, prep for tough questions, and think through your investor outreach.\n\n**Let's start here:** Are you raising now, or planning to raise in the next 1-6 months? And what round (pre-seed, seed, Series A)?`,
    'icp-workshop': ` **ICP Workshop activated!**\n\nLet's nail your Ideal Customer Profile — this is the most important work you'll do for sales and marketing.\n\n${ctxNote}\n\n**First question:** Who are your current customers or who do you imagine buying this first? Tell me whatever you know — industry, company size, job title, anything.`,
    'one-pager': ` **One-Pager Generator activated!**\n\nLet's create a crisp, compelling executive summary that gets replies from investors and partners.\n\n**To start: what's your startup's one-liner?** (The single sentence that explains what you do and for whom.)`,
    'competitor-analysis': ` **Competitor Analysis activated!**\n\n${ctxNote}\n\nLet's map your competitive landscape and find your positioning.\n\n**Who do you see as your main competitors?** List 2-5 names — they can be direct competitors, alternatives, or even "status quo" (how people solve this today without you).`,
    'business-model-canvas': `🗃 **Business Model Canvas activated!**\n\nLet's work through the Lean Canvas together. This will sharpen your business model and reveal any hidden risks.\n\n${ctxNote}\n\n**Start here:** Describe your target customer in one sentence, and the #1 problem you're solving for them.`,
    'growth-hacking': ` **Growth Hacking activated!**\n\n${ctxNote}\n\nLet's find your highest-leverage growth moves.\n\n**Quick growth audit:** What's your current monthly active users / MRR, your main acquisition channel right now, and where do you feel most stuck in growth?`,
    'cold-outreach': `📧 **Cold Outreach activated!**\n\nLet's write a cold sequence that actually gets replies.\n\n${ctxNote}\n\n**To start:** Who exactly are you reaching out to (job title/industry) and what is the specific pain point you want to highlight in the first email?`,
  };
  return greetings[pb.key] || `Welcome! I'm ready to help with **${pb.name}**. What would you like to work on?`;
}

function startPlaybookGreeting(pb, greeting) {
  welcomeScreen.style.display = 'none';
  chatMessages.style.display = 'flex';
  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();
    const aiMsg = { role: 'model', parts: [{ text: greeting }] };
    state.messages.push(aiMsg);
    appendMessage('model', greeting, formatTime());
    autoSave();
  }, 900);
}

// ── Projects ──────────────────────────────────
function renderProjectList() {
  projectList.innerHTML = '';

  if (state.projects.length === 0) {
    const el = document.createElement('div');
    el.style.cssText = 'font-size:0.75rem;color:var(--text-muted);padding:8px 4px;';
    el.textContent = 'No projects yet';
    projectList.appendChild(el);
    return;
  }

  state.projects.forEach(proj => {
    const el = document.createElement('div');
    el.className = `sidebar-item ${proj.id === state.activeProjectId ? 'active' : ''}`;
    el.innerHTML = `
      <span class="sidebar-item-icon">📁</span>
      <span class="sidebar-item-label">${escapeHtml(proj.name)}</span>
    `;
    el.addEventListener('click', () => {
      state.activeProjectId = proj.id;
      LS.set('activeProject', proj.id);
      loadProjectMessages(proj);
      renderProjectList();
      closeMobileSidebar();
    });
    projectList.appendChild(el);
  });
}

addProjectBtn?.addEventListener('click', () => {
  const name = prompt('Project name:');
  if (!name?.trim()) return;
  const proj = {
    id: Date.now().toString(),
    name: name.trim(),
    messages: [],
    playbook: state.activePlaybook || 'general',
    createdAt: new Date().toISOString()
  };
  state.projects.push(proj);
  LS.set('projects', state.projects);
  state.activeProjectId = proj.id;
  LS.set('activeProject', proj.id);
  renderProjectList();
  showToast(`✓ Project "${proj.name}" created`);
});

function loadProjectMessages(proj) {
  state.messages = proj.messages || [];
  state.activePlaybook = proj.playbook || 'general';
  state.activeProjectId = proj.id;

  const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
  activePlaybookName.textContent = `📁 ${proj.name}`;

  chatMessages.innerHTML = '';

  if (state.messages.length === 0) {
    welcomeScreen.style.display = 'flex';
    chatMessages.style.display = 'none';
  } else {
    welcomeScreen.style.display = 'none';
    chatMessages.style.display = 'flex';
    state.messages.forEach(msg => {
      appendMessage(msg.role, msg.parts[0].text, '', false);
    });
    scrollToBottom();
  }
}

// ── New Chat ──────────────────────────────────
newChatBtn?.addEventListener('click', () => {
  state.messages = [];
  state.activePlaybook = 'general';
  state.activeProjectId = null;
  LS.set('activeProject', null);
  activePlaybookName.textContent = 'General Chat';
  chatMessages.innerHTML = '';
  chatMessages.style.display = 'none';
  welcomeScreen.style.display = 'flex';
  renderPlaybookList();
  renderProjectList();
  closeMobileSidebar();
});

// ── Context Form ──────────────────────────────
function loadContextForm() {
  const ctx = state.context;
  if (ctxName)    ctxName.value    = ctx.name    || '';
  if (ctxStage)   ctxStage.value   = ctx.stage   || '';
  if (ctxMarket)  ctxMarket.value  = ctx.market  || '';
  if (ctxProblem) ctxProblem.value = ctx.problem  || '';
  if (ctxRevenue) ctxRevenue.value = ctx.revenue  || '';
  if (ctxGoal)    ctxGoal.value    = ctx.goal     || '';
}

saveContextBtn?.addEventListener('click', () => {
  state.context = {
    name:    ctxName?.value.trim()    || '',
    stage:   ctxStage?.value         || '',
    market:  ctxMarket?.value.trim()  || '',
    problem: ctxProblem?.value.trim() || '',
    revenue: ctxRevenue?.value.trim() || '',
    goal:    ctxGoal?.value.trim()    || '',
  };
  LS.set('context', state.context);
  ctxSavedMsg.classList.add('show');
  setTimeout(() => ctxSavedMsg.classList.remove('show'), 2500);
  showToast('✓ Startup context saved!');
});

function buildContextString() {
  const ctx = state.context;
  const parts = [];
  if (ctx.name)    parts.push(`Startup Name: ${ctx.name}`);
  if (ctx.stage)   parts.push(`Stage: ${ctx.stage}`);
  if (ctx.market)  parts.push(`Target Market: ${ctx.market}`);
  if (ctx.problem) parts.push(`Core Problem: ${ctx.problem}`);
  if (ctx.revenue) parts.push(`MRR: ${ctx.revenue}`);
  if (ctx.goal)    parts.push(`Current Goal: ${ctx.goal}`);
  if (parts.length === 0) return '';
  return '\n\n[STARTUP CONTEXT]\n' + parts.join('\n') + '\n[/STARTUP CONTEXT]';
}

// ── Chat Input ────────────────────────────────
chatInput?.addEventListener('input', () => {
  const len = chatInput.value.length;
  charCount.textContent = `${len} / 8000`;
  charCount.style.color = len > 7000 ? 'var(--rose)' : 'var(--text-muted)';

  // Auto-resize
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
});

chatInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn?.addEventListener('click', sendMessage);

// ── Send Message ──────────────────────────────
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || state.isLoading) return;
  if (!state.apiKey) { showToast('⚠ Please add your API key first.'); return; }

  // Free tier limit (20/day)
  const today = new Date().toDateString();
  const lastDay = LS.get('lastDay', '');
  if (lastDay !== today) {
    state.messageCount = 0;
    LS.set('lastDay', today);
  }
  if (state.messageCount >= 20 && !LS.get('isPro', false)) {
    showToast(' Daily limit reached. Upgrade to Builder for unlimited messages!');
    showUpgradeBanner();
    return;
  }

  // Hide welcome
  if (welcomeScreen.style.display !== 'none') {
    welcomeScreen.style.display = 'none';
    chatMessages.style.display = 'flex';
  }

  // Add user message
  const userText = text;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  charCount.textContent = '0 / 8000';
  const timeStr = formatTime();

  const userMsg = { role: 'user', parts: [{ text: userText }] };
  state.messages.push(userMsg);
  appendMessage('user', userText, timeStr);
  scrollToBottom();

  // Build system prompt
  const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
  const systemPrompt = pb.system + buildContextString();

  // Call API
  state.isLoading = true;
  sendBtn.disabled = true;
  showTypingIndicator();
  scrollToBottom();

  try {
    const responseText = await callGemini(systemPrompt, state.messages);
    removeTypingIndicator();

    const aiMsg = { role: 'model', parts: [{ text: responseText }] };
    state.messages.push(aiMsg);
    appendMessage('model', responseText, formatTime());
    scrollToBottom();

    state.messageCount++;
    LS.set('msgCount', state.messageCount);

    autoSave();
  } catch (err) {
    removeTypingIndicator();
    appendMessage('model', `⚠ **Error:** ${err.message}\n\nPlease check your API key or try again.`, formatTime());
    scrollToBottom();
  } finally {
    state.isLoading = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// ── Gemini API Call ───────────────────────────
async function callGemini(systemInstruction, messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${state.apiKey}`;

  // Convert messages to Gemini format
  // Don't include the last message (it's the user's latest) — we build the history
  const contents = messages.map(msg => ({
    role: msg.role,
    parts: msg.parts
  }));

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.85,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message || `HTTP ${res.status}`;
    if (res.status === 429) throw new Error('Rate limit hit. Wait a moment and try again.');
    if (res.status === 400) throw new Error('Invalid request. ' + msg);
    if (res.status === 403) throw new Error('Invalid or expired API key.');
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason;
    if (reason === 'SAFETY') throw new Error('Response blocked by safety filters. Try rephrasing.');
    throw new Error('No response received. Try again.');
  }
  return text;
}

// ── Render Messages ───────────────────────────
function appendMessage(role, text, time, animate = true) {
  const isUser = role === 'user';
  const row = document.createElement('div');
  row.className = `msg-row ${isUser ? 'user' : 'ai'}`;
  if (!animate) row.style.animation = 'none';

  const avatar = document.createElement('div');
  avatar.className = `msg-avatar ${isUser ? 'user-avatar-msg' : 'ai-avatar'}`;
  avatar.textContent = isUser ? getUserInitial() : '';

  const body = document.createElement('div');
  body.className = 'msg-body';

  const sender = document.createElement('div');
  sender.className = 'msg-sender';
  sender.textContent = isUser ? 'You' : 'ForgeAI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  if (isUser) {
    bubble.textContent = text;
  } else {
    bubble.className += ' md-content';
    try {
      bubble.innerHTML = marked.parse(text);
    } catch {
      bubble.textContent = text;
    }
  }

  const timeEl = document.createElement('div');
  timeEl.className = 'msg-time';
  timeEl.textContent = time;

  // Action buttons (copy, etc.)
  const actions = document.createElement('div');
  actions.className = 'msg-actions';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'msg-action-btn';
  copyBtn.innerHTML = '📋';
  copyBtn.title = 'Copy';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(text).then(() => showToast('✓ Copied to clipboard'));
  });
  actions.appendChild(copyBtn);

  body.appendChild(sender);
  body.appendChild(bubble);
  body.appendChild(timeEl);
  body.appendChild(actions);

  if (isUser) {
    row.appendChild(body);
    row.appendChild(avatar);
  } else {
    row.appendChild(avatar);
    row.appendChild(body);
  }

  chatMessages.appendChild(row);
}

function getUserInitial() {
  const name = state.context?.name;
  return name ? name[0].toUpperCase() : 'U';
}

function showTypingIndicator() {
  const row = document.createElement('div');
  row.className = 'typing-row';
  row.id = 'typingIndicator';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar ai-avatar';
  avatar.textContent = '';

  const bubble = document.createElement('div');
  bubble.className = 'typing-bubble';
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  scrollToBottom();
}

function removeTypingIndicator() {
  $('typingIndicator')?.remove();
}

function scrollToBottom() {
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 50);
}

// ── Auto-save to project ──────────────────────
function autoSave() {
  if (!state.activeProjectId) return;
  const idx = state.projects.findIndex(p => p.id === state.activeProjectId);
  if (idx !== -1) {
    state.projects[idx].messages = state.messages;
    state.projects[idx].playbook = state.activePlaybook;
    LS.set('projects', state.projects);
  }
}

// ── Export Chat ───────────────────────────────
exportBtn?.addEventListener('click', () => {
  if (state.messages.length === 0) { showToast('No messages to export.'); return; }
  const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
  let md = `# ForgeAI Export — ${pb.name}\n`;
  md += `_Exported on ${new Date().toLocaleDateString()}_\n\n---\n\n`;

  state.messages.forEach(msg => {
    const role = msg.role === 'user' ? '**You**' : '**ForgeAI**';
    md += `${role}\n\n${msg.parts[0].text}\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `forgeai-${pb.key}-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Chat exported as Markdown');
});

// ── Export Chat (PDF) ─────────────────────────
exportPdfBtn?.addEventListener('click', () => {
  if (state.messages.length === 0) { showToast('No messages to export.'); return; }
  
  if (typeof html2pdf === 'undefined') {
    showToast('⚠ PDF library is still loading. Try again in a moment.');
    return;
  }
  
  showToast('Generating PDF...');
  const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
  const filename = `forgeai-${pb.key}-${Date.now()}.pdf`;
  
  const opt = {
    margin:       10,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0f1423' },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Clone the messages div so we can style it for PDF without messing up the UI
  const elementToPrint = chatMessages.cloneNode(true);
  elementToPrint.style.display = 'block';
  elementToPrint.style.height = 'auto';
  elementToPrint.style.overflow = 'visible';
  elementToPrint.style.padding = '20px';
  elementToPrint.style.backgroundColor = '#0f1423'; 
  
  // Clean up action buttons in the clone
  const actionBtns = elementToPrint.querySelectorAll('.msg-actions');
  actionBtns.forEach(btn => btn.remove());
  
  html2pdf().set(opt).from(elementToPrint).save().then(() => {
    showToast('✓ PDF Exported');
  }).catch(err => {
    console.error(err);
    showToast('⚠ Error generating PDF');
  });
});

// ── Clear Chat ────────────────────────────────
clearChatBtn?.addEventListener('click', () => {
  if (state.messages.length === 0) return;
  if (!confirm('Clear this chat? This cannot be undone.')) return;
  state.messages = [];
  chatMessages.innerHTML = '';
  chatMessages.style.display = 'none';
  welcomeScreen.style.display = 'flex';
  autoSave();
  showToast('Chat cleared');
});

// ── Sidebar Toggle ────────────────────────────
sidebarToggle?.addEventListener('click', () => {
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    sidebar.classList.toggle('mobile-open');
  } else {
    state.sidebarOpen = !state.sidebarOpen;
    appShell.classList.toggle('sidebar-collapsed', !state.sidebarOpen);
  }
});

sidebarClose?.addEventListener('click', closeMobileSidebar);

function closeMobileSidebar() {
  if (window.innerWidth <= 900) {
    sidebar.classList.remove('mobile-open');
    contextPanel.classList.remove('mobile-open');
  }
}

// ── Context Panel Toggle ──────────────────────
contextPanelTgl?.addEventListener('click', () => {
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    contextPanel.classList.toggle('mobile-open');
  } else {
    state.contextPanelOpen = !state.contextPanelOpen;
    appShell.classList.toggle('context-collapsed', !state.contextPanelOpen);
  }
});

cpClose?.addEventListener('click', () => {
  if (window.innerWidth <= 900) {
    contextPanel.classList.remove('mobile-open');
  } else {
    state.contextPanelOpen = false;
    appShell.classList.add('context-collapsed');
  }
});

// ── Settings ──────────────────────────────────
settingsBtn?.addEventListener('click', () => {
  settingsKeyInput.value = state.apiKey ? '••••••••' + state.apiKey.slice(-4) : '';
  settingsOverlay.classList.add('open');
});
settingsClose?.addEventListener('click', () => settingsOverlay.classList.remove('open'));
settingsOverlay?.addEventListener('click', e => { if (e.target === settingsOverlay) settingsOverlay.classList.remove('open'); });

updateKeyBtn?.addEventListener('click', () => {
  const key = settingsKeyInput.value.trim();
  if (!key || key.startsWith('••••')) { showToast('Enter a new API key to update.'); return; }
  state.apiKey = key;
  LS.set('apiKey', key);
  settingsOverlay.classList.remove('open');
  showToast('✓ API key updated');
});

modelSelect?.addEventListener('change', () => {
  state.model = modelSelect.value;
  LS.set('model', state.model);
  showToast(`✓ Model switched to ${state.model}`);
});

clearAllDataBtn?.addEventListener('click', () => {
  if (!confirm('Delete ALL ForgeAI data? This includes all chats, projects, and settings. This cannot be undone.')) return;
  ['apiKey','model','projects','context','activeProject','msgCount','lastDay','isPro'].forEach(k => LS.remove(k));
  location.reload();
});

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
    appShell.classList.remove('sidebar-collapsed', 'context-collapsed');
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

// ── Start ─────────────────────────────────────
init();
