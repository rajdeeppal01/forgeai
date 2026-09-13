// ── Auth & Init ───────────────────────────────
window.currentUser = null;

function init() {
  // Load Theme
  if (LS.get('theme') === 'dark') {
    document.documentElement.classList.add('dark-theme');
  }

  // Load local state first
  state.apiKey     = LS.get('apiKey', '');
  state.model      = LS.get('model', 'gemini-3.5-flash');
  state.projects   = LS.get('projects', []);
  state.context    = LS.get('context', {});
  state.messageCount = LS.get('msgCount', 0);
  state.activeProjectId = LS.get('activeProject', null);

  const urlParams = new URLSearchParams(window.location.search);
  const authParam = urlParams.get('auth');
  const ideaParam = urlParams.get('idea');

  if (authParam === 'register') {
    switchAuthMode(true);
  }

  if (ideaParam) {
    // Free Preview bypass for the first action
    if (!state.apiKey) {
      state.apiKey = "FREE_PREVIEW_KEY_PLACEHOLDER"; // Fallback key for the preview
    }
    // We will process the idea after auth/sync is complete
  }

  // Check Auth State
  try {
    auth.onAuthStateChanged(user => {
      globalLoader.classList.add('hidden');
      if (user) {
        window.currentUser = user;
        authModal.classList.add('hidden');
        syncFromFirestore(user.uid);
        
        // Show tour on first login
        if (!LS.get('seen_tour')) {
          setTimeout(startTour, 500); // Wait for DOM to settle
          LS.set('seen_tour', true);
        }
      } else {
        window.currentUser = null;
        authModal.classList.remove('hidden');
        appShell.style.display = 'none';
        apiKeyModal.classList.add('hidden');
      }
    });
  } catch(e) {
    console.error("Firebase not configured", e);
  }
}

function checkApiKey() {
  const urlParams = new URLSearchParams(window.location.search);
  const ideaParam = urlParams.get('idea');

  if (!state.apiKey) {
    apiKeyModal.classList.remove('hidden');
    appShell.style.display = 'none';
  } else {
    apiKeyModal.classList.add('hidden');
    appShell.style.display = 'grid';
    const pbParam = urlParams.get('playbook');
    loadApp(pbParam);

    // If an idea was passed from the landing page, auto-start a new project
    if (ideaParam && !window.ideaProcessed) {
      window.ideaProcessed = true; // Prevent double-triggering
      setTimeout(() => {
        if (typeof generateBusinessDashboard === 'function') {
          generateBusinessDashboard(ideaParam);
        } else {
          startNewProject('company-builder');
          chatInput.value = ideaParam;
          sendMessage();
        }
        
        // Clean up the URL so refreshing doesn't re-trigger it
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 500);
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
