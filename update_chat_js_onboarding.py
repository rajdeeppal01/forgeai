import re
import os

chat_js_path = os.path.join('js', 'chat.js')
with open(chat_js_path, 'r', encoding='utf-8') as f:
    chat_js = f.read()

# 1. loadApp: show onboarding modal
old_load_app = """function loadApp(preselectedPlaybook = null) {
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
}"""

new_load_app = """function loadApp(preselectedPlaybook = null) {
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
}"""

chat_js = chat_js.replace(old_load_app, new_load_app)

# 2. loadProjectMessages: load proj.context
old_load_proj = """function loadProjectMessages(proj) {
  state.messages = proj.messages || [];
  state.activePlaybook = proj.playbook || 'general';
  state.activeProjectId = proj.id;

  const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
  activePlaybookName.textContent = `📁 ${proj.name}`;

  chatMessages.innerHTML = '';"""

new_load_proj = """function loadProjectMessages(proj) {
  state.messages = proj.messages || [];
  state.activePlaybook = proj.playbook || 'general';
  state.activeProjectId = proj.id;
  state.context = proj.context || {};
  loadContextForm();

  const pb = PLAYBOOKS.find(p => p.key === state.activePlaybook) || PLAYBOOKS[0];
  activePlaybookName.textContent = `📁 ${proj.name}`;

  chatMessages.innerHTML = '';"""

chat_js = chat_js.replace(old_load_proj, new_load_proj)

# 3. saveContextBtn listener
old_save_ctx = """saveContextBtn?.addEventListener('click', () => {
  state.context = {
    name:    ctxName?.value.trim()    || '',
    stage:   ctxStage?.value         || '',
    market:  ctxMarket?.value.trim()  || '',
    problem: ctxProblem?.value.trim() || '',
    revenue: ctxRevenue?.value.trim() || '',
    goal:    ctxGoal?.value.trim()    || '',
  };
  LS.set('context', state.context);
  
  // Also rename active project if name changed
  if (state.activeProjectId && state.context.name) {
    const projIdx = state.projects.findIndex(p => p.id === state.activeProjectId);
    if (projIdx !== -1 && state.projects[projIdx].name !== state.context.name) {
      state.projects[projIdx].name = state.context.name;
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
});"""

new_save_ctx = """saveContextBtn?.addEventListener('click', () => {
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
});"""

chat_js = chat_js.replace(old_save_ctx, new_save_ctx)

# 4. new project creation context copy
old_new_proj = """    const proj = {
      id: Date.now().toString(),
      name: userText.substring(0, 25) + (userText.length > 25 ? '...' : ''),
      messages: [],
      playbook: state.activePlaybook || 'general',
      createdAt: new Date().toISOString()
    };
    state.projects.unshift(proj); // Add to top"""

new_new_proj = """    const proj = {
      id: Date.now().toString(),
      name: state.context.name || (userText.substring(0, 25) + (userText.length > 25 ? '...' : '')),
      messages: [],
      playbook: state.activePlaybook || 'general',
      context: { ...state.context },
      createdAt: new Date().toISOString()
    };
    state.projects.unshift(proj); // Add to top"""

chat_js = chat_js.replace(old_new_proj, new_new_proj)

# 5. Add onboarding logic event listeners at the end
onboarding_logic = """
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
"""
chat_js += onboarding_logic

with open(chat_js_path, 'w', encoding='utf-8') as f:
    f.write(chat_js)

print("Updated chat.js for context separation and onboarding flow")
