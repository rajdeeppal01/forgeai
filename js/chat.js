function loadApp(preselectedPlaybook = null) {
  if (modelSelect) modelSelect.value = state.model;
  loadContextForm();
  renderPlaybookList();
  renderProjectList();
  renderWelcomePlaybooks();

  if (preselectedPlaybook) {
    activatePlaybook(preselectedPlaybook);
  } else if (state.activeProjectId) {
    const proj = state.projects.find(p => p.id === state.activeProjectId);
    if (proj) loadProjectMessages(proj);
  }
  
  // Show onboarding if no projects
  if (state.projects.length === 0 && !LS.get('onboardingDone')) {
    const onboardingModal = document.getElementById('onboardingModal');
    if (onboardingModal) onboardingModal.classList.remove('hidden');
  }

  checkResponsive();
}

async function validateApiKey(key) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`,
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
    el.innerHTML = `<span class="sidebar-item-label">${pb.name}</span>`;
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
  state.activeProjectId = null;
  LS.set('activeProject', null);
  
  if (window.greetingTimeoutId) {
    clearTimeout(window.greetingTimeoutId);
  }

  // Update UI
  activePlaybookName.textContent = pb.name;
  renderPlaybookList();

  // Show welcome or reset chat
  chatMessages.innerHTML = '';
  chatMessages.style.display = 'none';
  welcomeScreen.style.display = 'flex';

  // If not general, add a greeting
  if (pb.key !== 'general') {
    state.messages = [];
    if (window.startGreetingTimeoutId) clearTimeout(window.startGreetingTimeoutId);
    
    const ctx = state.context;
    const hasCtx = ctx.name || ctx.problem;
    
    if (hasCtx) {
      // Use AI generated playbook
      generateCustomPlaybookGreeting(pb);
    } else {
      // Fallback to static
      const greeting = getPlaybookGreeting(pb);
      window.startGreetingTimeoutId = setTimeout(() => startPlaybookGreeting(pb, greeting), 100);
    }
  }

  closeMobileSidebar();
}


async function generateCustomPlaybookGreeting(pb) {
  welcomeScreen.style.display = 'none';
  chatMessages.style.display = 'flex';
  
  // Show typing indicator in chat
  showTypingIndicator();
  
  const ctxString = buildContextString();
  const prompt = `You are an elite startup advisor and VC. The user has opened the "${pb.name}" department playbook.
  
Here is their startup context:${ctxString}

Please generate a highly customized, actionable 3-step initial playbook for ${pb.name} tailored specifically to this startup's context. 
Be concise, use markdown formatting, and make the advice highly specific to their stated problem and market.
End the message by asking the user for their thoughts or feedback on this plan, or what they'd like to dive into first.`;

  try {
    const apiKey = state.apiKey;
    if (!apiKey || apiKey === 'FREE_PREVIEW_KEY_PLACEHOLDER') {
      throw new Error("No API key provided.");
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    removeTypingIndicator();

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    let text = '';
    if (data.candidates && data.candidates[0].content.parts) {
      text = data.candidates[0].content.parts.map(p => p.text).join('');
    } else {
      throw new Error("Invalid response format");
    }

    const aiMsg = { role: 'model', parts: [{ text: text }] };
    state.messages.push(aiMsg);
    appendMessage('model', text, formatTime());
    autoSave();

  } catch (err) {
    console.error('Error generating custom playbook:', err);
    removeTypingIndicator();
    // Fallback to static greeting
    const staticGreeting = getPlaybookGreeting(pb);
    const aiMsg = { role: 'model', parts: [{ text: staticGreeting }] };
    state.messages.push(aiMsg);
    appendMessage('model', staticGreeting, formatTime());
    autoSave();
  }
}

function getPlaybookGreeting(pb) {
  const ctx = state.context;
  const hasCtx = ctx.name || ctx.problem;
  const ctxNote = hasCtx
    ? `I can see you're building **${ctx.name || 'your startup'}**${ctx.stage ? ` at the ${ctx.stage} stage` : ''}. Great - let's use that context.`
    : `First, a quick tip: fill out your **Startup Context** (right panel) so I can give you tailored advice.`;

  const greetings = {
    'pitch-deck': ` **Pitch Deck Builder activated!**\n\n${ctxNote}\n\nI'm going to help you build a VC-grade pitch deck slide by slide. Let's start with the foundation:\n\n**What problem does your startup solve, and for whom?** (Don't overthink it - just tell me like you're talking to a friend.)`,
    'gtm-strategy': ` **GTM Strategy activated!**\n\n${ctxNote}\n\nLet's build your go-to-market strategy from the ground up.\n\n**Quick question to start:** Are you targeting B2B or B2C, and what stage are you at - pre-launch, just launched, or have some customers already?`,
    'fundraising': ` **Fundraising Prep activated!**\n\nI'm your fundraising coach. I'll help you craft a compelling narrative, prep for tough questions, and think through your investor outreach.\n\n**Let's start here:** Are you raising now, or planning to raise in the next 1-6 months? And what round (pre-seed, seed, Series A)?`,
    'icp-workshop': ` **ICP Workshop activated!**\n\nLet's nail your Ideal Customer Profile - this is the most important work you'll do for sales and marketing.\n\n${ctxNote}\n\n**First question:** Who are your current customers or who do you imagine buying this first? Tell me whatever you know - industry, company size, job title, anything.`,
    'one-pager': ` **One-Pager Generator activated!**\n\nLet's create a crisp, compelling executive summary that gets replies from investors and partners.\n\n**To start: what's your startup's one-liner?** (The single sentence that explains what you do and for whom.)`,
    'competitor-analysis': ` **Competitor Analysis activated!**\n\n${ctxNote}\n\nLet's map your competitive landscape and find your positioning.\n\n**Who do you see as your main competitors?** List 2-5 names - they can be direct competitors, alternatives, or even "status quo" (how people solve this today without you).`,
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

  window.greetingTimeoutId = setTimeout(() => {
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
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showProjectContextMenu(e, proj);
    });
    projectList.appendChild(el);
  });
}


function loadProjectMessages(proj) {
  state.messages = proj.messages || [];
  state.activePlaybook = proj.playbook || 'general';
  state.activeProjectId = proj.id;
  state.context = proj.context || {};
  loadContextForm();

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
  
  if (state.activeProjectId) {
    const projIdx = state.projects.findIndex(p => p.id === state.activeProjectId);
    if (projIdx !== -1) {
      state.projects[projIdx].context = { ...state.context };
      if (state.context.name && state.projects[projIdx].name !== state.context.name) {
        state.projects[projIdx].name = state.context.name;
      }
      LS.set('projects', state.projects);
      if (typeof renderProjectList === 'function') renderProjectList();
      if (typeof syncProjectToFirestore === 'function') syncProjectToFirestore(state.projects[projIdx]);
    }
  }
  if (typeof syncContextToFirestore === 'function') {
    syncContextToFirestore();
  } else {
    syncToFirestore(); // fallback if not updated
  }
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
  let userText = text;
  
  if (state.attachedDocumentText) {
    userText += `\n\n[ATTACHED DOCUMENT: ${state.attachedDocumentName}]\n${state.attachedDocumentText}\n[/ATTACHED DOCUMENT]\n`;
    state.attachedDocumentText = '';
    state.attachedDocumentName = '';
  }

  chatInput.value = '';
  chatInput.style.height = 'auto';
  charCount.textContent = '0 / 8000';
  const timeStr = formatTime();

  // Auto-create chat session if none exists
  let isNewChat = false;
  if (!state.activeProjectId) {
    isNewChat = true;
    const proj = {
      id: Date.now().toString(),
      name: state.context.name || (userText.substring(0, 25) + (userText.length > 25 ? '...' : '')),
      messages: [],
      playbook: state.activePlaybook || 'general',
      context: { ...state.context },
      createdAt: new Date().toISOString()
    };
    state.projects.unshift(proj); // Add to top
    state.activeProjectId = proj.id;
    LS.set('activeProject', proj.id);
    LS.set('projects', state.projects);
    renderProjectList();
  }

  const userMsg = { role: 'user', parts: [{ text: userText }] };
  state.messages.push(userMsg);
  // Only display the original typed text to avoid UI bloat
  appendMessage('user', text, timeStr);
  scrollToBottom();
  
  // Auto-save immediately
  autoSave();

  if (isNewChat) {
    // Generate a better name in the background
    setTimeout(async () => {
      try {
        const titlePrompt = `Summarize this user prompt in 2 to 4 words max to use as a chat title. Output ONLY the title, no quotes or intro text: "${userText}"`;
        const title = await callGemini(titlePrompt, []);
        if (title && title.trim()) {
          const idx = state.projects.findIndex(p => p.id === state.activeProjectId);
          if (idx !== -1) {
            state.projects[idx].name = title.trim().replace(/^["']|["']$/g, '');
            LS.set('projects', state.projects);
            renderProjectList();
            if (typeof syncProjectToFirestore === 'function') {
              syncProjectToFirestore(state.projects[idx]);
            }
          }
        }
      } catch (err) { console.error("Title generation failed", err); }
    }, 500); // Wait a bit so the main chat UI updates first
  }

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
  if (state.apiKey === "FREE_PREVIEW_KEY_PLACEHOLDER") {
    // Free Preview Mock Response
    return new Promise((resolve) => {
      setTimeout(() => {
        state.apiKey = ''; // Reset so they need a real key next time
        LS.set('apiKey', '');
        resolve(`I love this idea! I've gone ahead and broken it down into a structured Company Brief for us.

[ACTION_ITEM: Startup Context]
{
  "name": "Project Alpha",
  "stage": "Idea / Pre-Product",
  "market": "Consumers / B2C",
  "problem": "We are building a platform that solves the core problem you just described.",
  "revenue": "$0",
  "goal": "Launch MVP and get first 10 paying customers"
}
[/ACTION_ITEM]

Review the brief above and click **Approve & Save** to add it to your Startup Context. Once you do that, we can move into the Product or Growth departments. 

*(Note: To continue building, please click Settings and add your free Google Gemini API key!)*`);
      }, 2000);
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${state.apiKey}`;

  // Convert messages to Gemini format
  // Don't include the last message (it's the user's latest) - we build the history
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
    let contentText = text;
    let actionItemHtml = '';

    // Parse [ACTION_ITEM: Title] blocks
    const actionRegex = /\[ACTION_ITEM:\s*(.*?)\]([\s\S]*?)\[\/ACTION_ITEM\]/g;
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      const title = match[1];
      const jsonContent = match[2].trim();
      contentText = contentText.replace(match[0], '').trim();

      actionItemHtml += `
        <div class="action-item-card">
          <div class="action-item-header">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Pending Action: ${title}
          </div>
          <div class="action-item-body">${escapeHtml(jsonContent)}</div>
          <div class="action-item-footer">
            <button class="action-btn-reject" onclick="this.closest('.action-item-card').remove();">Reject</button>
            <button class="action-btn-approve" onclick="handleActionApprove(this, '${escapeHtml(jsonContent).replace(/'/g, "\\'")}');">Approve & Save</button>
          </div>
        </div>
      `;
    }

    try {
      bubble.innerHTML = marked.parse(contentText) + actionItemHtml;
    } catch {
      bubble.innerHTML = contentText + actionItemHtml;
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
    if (typeof syncProjectToFirestore === 'function') {
      syncProjectToFirestore(state.projects[idx]);
    }
  }
}

// ── Export Chat ───────────────────────────────
exportBtn?.addEventListener('click', () => {
  if (state.messages.length === 0) { showToast('No messages to export.'); return; }
  const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
  let md = `# ForgeAI Export - ${pb.name}\n`;
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
// ── Clear Chat ────────────────────────────────
if (typeof clearChatBtn !== 'undefined' && clearChatBtn) {
  clearChatBtn.addEventListener('click', () => {
    if (state.messages.length === 0) return;
    if (!confirm('Clear this chat? This cannot be undone.')) return;
    state.messages = [];
    chatMessages.innerHTML = '';
    chatMessages.style.display = 'none';
    welcomeScreen.style.display = 'flex';
    autoSave();
    showToast('Chat cleared');
  });
}

// ── File Upload Logic ─────────────────────────────
if (typeof attachBtn !== 'undefined' && attachBtn) {
  attachBtn.addEventListener('click', () => {
    fileUpload.click();
  });
}

if (typeof fileUpload !== 'undefined' && fileUpload) {
  fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast(`Reading ${file.name}...`);
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
      } else {
        text = await file.text();
      }
      
      state.attachedDocumentText = text;
      state.attachedDocumentName = file.name;
      showToast(`✓ ${file.name} attached! (Will be sent with next message)`);
      chatInput.focus();
    } catch(err) {
      console.error(err);
      showToast(`⚠ Error reading file: ${err.message}`);
    }
    fileUpload.value = ''; // reset
  });
}

// ── Export Chat (PPTX) ─────────────────────────
if (typeof exportPptxBtn !== 'undefined' && exportPptxBtn) {
  exportPptxBtn.addEventListener('click', async () => {
    if (state.messages.length === 0) { showToast('No messages to export.'); return; }
    
    if (typeof pptxgen === 'undefined') {
      showToast('⚠ PPTX library is still loading. Try again in a moment.');
      return;
    }
    
    showToast('Generating PPTX...');
    try {
      const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
      const pres = new pptxgen();
      
      const aiMessages = state.messages.filter(m => m.role === 'model');
      
      if (aiMessages.length === 0) {
        showToast('⚠ No AI content to export.');
        return;
      }
      
      const prompt = `Convert the following conversation history into a structured JSON for a presentation. 
      Format required: 
      [
        { "title": "Slide Title", "bullets": ["Point 1", "Point 2", "Point 3"] }
      ]
      
      Conversation History:
      ${aiMessages.map(m => m.parts[0].text).join('\n\n---\n\n')}
      
      Output ONLY valid JSON.`;
      
      showToast('Structuring slides with AI...', 4000);
      const jsonStr = await callGemini(prompt, []);
      let slidesData = [];
      try {
        const cleanJsonStr = jsonStr.replace(/^```json/g, '').replace(/```$/g, '').trim();
        slidesData = JSON.parse(cleanJsonStr);
      } catch(e) {
        console.warn("Failed to parse JSON for PPTX", e, jsonStr);
        throw new Error("AI didn't return valid slide data.");
      }
      
      slidesData.forEach(slideData => {
        let slide = pres.addSlide();
        slide.addText(slideData.title || "Slide", { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, bold: true, color: '363636' });
        const bulletStr = slideData.bullets ? slideData.bullets.map(b => "• " + b).join('\n\n') : "";
        slide.addText(bulletStr, { x: 0.5, y: 1.8, w: 9, h: 3.5, fontSize: 18, color: '666666' });
      });
      
      const filename = `forgeai-${pb.key}-${Date.now()}.pptx`;
      pres.writeFile({ fileName: filename });
      showToast('✓ PPTX Exported');
    } catch(err) {
      console.error(err);
      showToast(`⚠ Error: ${err.message}`);
    }
  });
}


window.handleActionApprove = function(btn, jsonStr) {
  try {
    const data = JSON.parse(jsonStr.replace(/&quot;/g, '\"'));
    const ctx = state.context;
    if(data.name) ctx.name = data.name;
    if(data.stage) ctx.stage = data.stage;
    if(data.market) ctx.market = data.market;
    if(data.problem) ctx.problem = data.problem;
    if(data.revenue) ctx.revenue = data.revenue;
    if(data.goal) ctx.goal = data.goal;
    
    LS.set('context', ctx);
    loadContextForm();
    
    btn.closest('.action-item-card').innerHTML = '<div style="padding: 16px; color: var(--green); font-weight: 500; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Context Approved & Saved!</div>';
    showToast('Startup Context updated successfully.');
  } catch(e) {
    console.error('Failed to parse Action Item JSON', e);
    showToast('Error saving context.');
  }
};


// ── Instant Business Dashboard ───────────────────────────
window.generateBusinessDashboard = async function(idea) {
  const welcomeScreen = document.getElementById('welcomeScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const dashboardLoading = document.getElementById('dashboardLoading');
  const dashboardGrid = document.getElementById('dashboardGrid');
  const dashboardActions = document.getElementById('dashboardActions');
  
  // Hide welcome, show dashboard loading
  if(welcomeScreen) welcomeScreen.style.display = 'none';
  if(dashboardScreen) dashboardScreen.style.display = 'block';
  dashboardLoading.style.display = 'flex';
  dashboardGrid.style.display = 'none';
  dashboardActions.style.display = 'none';
  const chatInputArea = document.querySelector('.chat-input-area');
  if(chatInputArea) chatInputArea.style.display = 'none';

  const prompt = `You are an elite VC and startup consultant. The user has an idea: "${idea}"
  
Generate a comprehensive, mathematically sound, and highly strategic business breakdown.
Return ONLY valid JSON matching this exact schema:
{
  "startupName": "A catchy, short name for the startup",
  "oneLiner": "A punchy, 10-word value proposition",
  "targetAudience": "Who is the exact ICP? Be specific.",
  "coreProblem": "What painful problem are they solving? 1-2 sentences.",
  "valueProposition": "How does this solve the problem 10x better?",
  "businessModel": "How will they make money? (e.g., $99/mo SaaS, 15% take rate).",
  "gtmStrategy": "A 3-step actionable go-to-market plan to get the first 100 customers."
}`;

  try {
    const apiKey = state.apiKey;
    if (!apiKey || apiKey === 'FREE_PREVIEW_KEY_PLACEHOLDER') throw new Error("No API key provided. Please log in or enter an API key.");
    
    // We do a raw fetch to ensure we can use JSON responseMimeType
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    };
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error("API Error: " + (errData?.error?.message || `HTTP ${res.status}`));
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("No text returned");
    
    const insights = JSON.parse(text);
    
    // Populate UI
    document.getElementById('dashStartupName').textContent = insights.startupName;
    document.getElementById('dashOneLiner').textContent = insights.oneLiner;
    document.getElementById('dashAudience').textContent = insights.targetAudience;
    document.getElementById('dashProblem').textContent = insights.coreProblem;
    document.getElementById('dashValueProp').textContent = insights.valueProposition;
    document.getElementById('dashBusinessModel').textContent = insights.businessModel;
    
    // Convert 3-step GTM into list items
    const gtmArr = insights.gtmStrategy.split(/(?=\d\.)/);
    let gtmHtml = '<ul>';
    for(const step of gtmArr) {
      if(step.trim().length > 0) gtmHtml += `<li>${step.trim()}</li>`;
    }
    gtmHtml += '</ul>';
    document.getElementById('dashGTM').innerHTML = gtmHtml;
    
    // Switch UI states
    dashboardLoading.style.display = 'none';
    dashboardGrid.style.display = 'grid';
    dashboardActions.style.display = 'block';
    
    // Save state internally as first message
    const projId = Date.now().toString();
    const initMsg = `I've generated a business strategy dashboard for **${insights.startupName}** based on your idea: *"${idea}"*.\n\nWhat area would you like to drill into next? We can expand the GTM strategy, build a Pitch Deck, or refine the Business Model.`;
    
    const proj = {
      id: projId,
      name: insights.startupName,
      messages: [
        { role: 'user', parts: [{ text: idea }] },
        { role: 'model', parts: [{ text: initMsg }] }
      ],
      playbook: 'company-builder',
      createdAt: new Date().toISOString()
    };
    
    state.projects.unshift(proj);
    LS.set('projects', state.projects);
    if (typeof renderProjectList === 'function') renderProjectList();
    if (typeof syncProjectToFirestore === 'function') syncProjectToFirestore(proj);
    
    // AUTO-FILL CONTEXT
    state.context = {
      name: insights.startupName,
      stage: 'Idea / Pre-Product',
      market: insights.targetAudience,
      problem: insights.coreProblem,
      revenue: '0',
      goal: 'Launch MVP and get first 10 customers'
    };
    LS.set('context', state.context);
    if (typeof loadContextForm === 'function') loadContextForm();
    if (typeof syncContextToFirestore === 'function') syncContextToFirestore();
    
    document.getElementById('dashContinueBtn').onclick = () => {
      dashboardScreen.style.display = 'none';
      if (chatInputArea) chatInputArea.style.display = '';
      
      // Set active project and render
      state.activeProjectId = projId;
      state.activePlaybook = 'company-builder';
      state.messages = proj.messages;
      LS.set('activeProject', projId);
      
      const welcomeScreen = document.getElementById('welcomeScreen');
      const chatMessages = document.getElementById('chatMessages');
      if (welcomeScreen) welcomeScreen.style.display = 'none';
      if (chatMessages) {
        chatMessages.style.display = 'flex';
        chatMessages.innerHTML = '';
        state.messages.forEach(m => {
          appendMessage(m.role, m.parts[0].text, formatTime(), false);
        });
        scrollToBottom();
      }
    };

  } catch (err) {
    console.error(err);
    document.getElementById('dashboardLoadingText').innerHTML = "Error: " + err.message + "<br><br><button onclick='location.reload()' style='padding: 8px 16px; background: var(--bg-card); color: white; border: 1px solid var(--border); border-radius: 4px;'>Refresh</button>";
  }
};

// ── Project Context Menu ───────────────────────
let currentContextMenu = null;

function showProjectContextMenu(e, proj) {
  if (currentContextMenu) {
    currentContextMenu.remove();
  }

  const menu = document.createElement('div');
  menu.className = 'project-context-menu';
  menu.style.position = 'fixed';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.style.background = 'var(--bg-secondary)';
  menu.style.border = '1px solid var(--border)';
  menu.style.borderRadius = 'var(--radius-md)';
  menu.style.padding = '8px 0';
  menu.style.boxShadow = '0 10px 40px rgba(0,0,0,0.4)';
  menu.style.zIndex = '9999';
  menu.style.minWidth = '140px';
  
  const renameBtn = document.createElement('div');
  renameBtn.textContent = 'Rename';
  renameBtn.style.padding = '8px 16px';
  renameBtn.style.cursor = 'pointer';
  renameBtn.style.color = 'var(--text-primary)';
  renameBtn.style.fontSize = '0.9rem';
  renameBtn.onmouseover = () => renameBtn.style.background = 'var(--bg-card-hover)';
  renameBtn.onmouseout = () => renameBtn.style.background = 'transparent';
  renameBtn.onclick = () => {
    menu.remove();
    const newName = prompt('Enter new project name:', proj.name);
    if (newName && newName.trim()) {
      proj.name = newName.trim();
      saveProjectsToFirebase();
      renderProjectList();
      if(state.activeProjectId === proj.id) {
        activePlaybookName.textContent = `📁 ${proj.name}`;
      }
    }
  };

  const deleteBtn = document.createElement('div');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.padding = '8px 16px';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.style.color = 'var(--rose)';
  deleteBtn.style.fontSize = '0.9rem';
  deleteBtn.onmouseover = () => deleteBtn.style.background = 'var(--bg-card-hover)';
  deleteBtn.onmouseout = () => deleteBtn.style.background = 'transparent';
  deleteBtn.onclick = () => {
    menu.remove();
    if (confirm(`Are you sure you want to delete "${proj.name}"?`)) {
      state.projects = state.projects.filter(p => p.id !== proj.id);
      if (state.activeProjectId === proj.id) {
        state.activeProjectId = null;
        LS.remove('activeProject');
        welcomeScreen.style.display = 'flex';
        chatMessages.style.display = 'none';
        activePlaybookName.textContent = 'General Chat';
      }
      saveProjectsToFirebase();
      renderProjectList();
    }
  };

  menu.appendChild(renameBtn);
  menu.appendChild(deleteBtn);
  document.body.appendChild(menu);
  currentContextMenu = menu;

  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() {
      if (currentContextMenu) currentContextMenu.remove();
      currentContextMenu = null;
      document.removeEventListener('click', closeMenu);
    });
  }, 0);
}

// ── Onboarding Handlers ───────────────────────
const onboardSubmitBtn = document.getElementById('onboardSubmitBtn');
const onboardSkipBtn = document.getElementById('onboardSkipBtn');
const onboardingModal = document.getElementById('onboardingModal');
const onboardName = document.getElementById('onboardName');
const onboardProblem = document.getElementById('onboardProblem');
const onboardMarket = document.getElementById('onboardMarket');

if (onboardSubmitBtn) {
  onboardSubmitBtn.addEventListener('click', () => {
    state.context = {
      name: onboardName.value.trim(),
      problem: onboardProblem.value.trim(),
      market: onboardMarket.value.trim(),
      stage: 'Idea / Pre-Product',
      revenue: '',
      goal: ''
    };
    
    // Create first project
    const proj = {
      id: Date.now().toString(),
      name: state.context.name || 'My First Startup',
      messages: [],
      playbook: 'general',
      context: { ...state.context },
      createdAt: new Date().toISOString()
    };
    
    state.projects.unshift(proj);
    state.activeProjectId = proj.id;
    LS.set('activeProject', proj.id);
    LS.set('projects', state.projects);
    LS.set('context', state.context);
    LS.set('onboardingDone', true);
    
    renderProjectList();
    loadContextForm();
    onboardingModal.classList.add('hidden');
    
    // Open context panel to show where it is
    state.contextPanelOpen = true;
    document.getElementById('appShell').classList.remove('context-collapsed');
    showToast('✓ Project created based on your answers!');
  });
}

if (onboardSkipBtn) {
  onboardSkipBtn.addEventListener('click', () => {
    LS.set('onboardingDone', true);
    onboardingModal.classList.add('hidden');
  });
}
