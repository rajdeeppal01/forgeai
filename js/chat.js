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
  checkResponsive();
}

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
    const greeting = getPlaybookGreeting(pb);
    state.messages = [];
    if (window.startGreetingTimeoutId) clearTimeout(window.startGreetingTimeoutId);
    window.startGreetingTimeoutId = setTimeout(() => startPlaybookGreeting(pb, greeting), 100);
  }

  closeMobileSidebar();
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
    projectList.appendChild(el);
  });
}


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
  syncToFirestore();
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

  // Auto-create chat session if none exists
  let isNewChat = false;
  if (!state.activeProjectId) {
    isNewChat = true;
    const proj = {
      id: Date.now().toString(),
      name: userText.substring(0, 25) + (userText.length > 25 ? '...' : ''),
      messages: [],
      playbook: state.activePlaybook || 'general',
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
  appendMessage('user', userText, timeStr);
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
            syncToFirestore();
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
    syncToFirestore();
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
      
      const curr = chatInput.value;
      chatInput.value = curr + `\n\n[ATTACHED DOCUMENT: ${file.name}]\n${text}\n[/ATTACHED DOCUMENT]\n`;
      showToast(`✓ ${file.name} attached!`);
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
