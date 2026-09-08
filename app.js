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
  if (urlParams.get('auth') === 'register') {
    switchAuthMode(true);
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
  if (!state.apiKey) {
    apiKeyModal.classList.remove('hidden');
    appShell.style.display = 'none';
  } else {
    apiKeyModal.classList.add('hidden');
    appShell.style.display = 'grid';
    const pbParam = new URLSearchParams(window.location.search).get('playbook');
    loadApp(pbParam);
  }
}

document.addEventListener('DOMContentLoaded', init);
