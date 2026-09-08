// ── Auth UI Handlers ──────────────────────────
let isRegisterMode = false;

function switchAuthMode(toRegister) {
  isRegisterMode = toRegister;
  authError.textContent = '';
  if (toRegister) {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    authModalTitle.textContent = 'Create an Account';
    authSubmitBtn.textContent = 'Register →';
    forgotPasswordLink.style.display = 'none';
  } else {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authModalTitle.textContent = 'Sign In to ForgeAI';
    authSubmitBtn.textContent = 'Log In →';
    forgotPasswordLink.style.display = 'inline';
  }
}

if (tabLogin) tabLogin.addEventListener('click', () => switchAuthMode(false));
if (tabRegister) tabRegister.addEventListener('click', () => switchAuthMode(true));

if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmail.value.trim();
    const pass = authPassword.value;
    if (!email || !pass) return (authError.textContent = 'Please enter email and password.');
    
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Loading...';
    authError.textContent = '';

    try {
      if (isRegisterMode) {
        await auth.createUserWithEmailAndPassword(email, pass);
      } else {
        await auth.signInWithEmailAndPassword(email, pass);
      }
    } catch (err) {
      authError.textContent = err.message;
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isRegisterMode ? 'Register →' : 'Log In →';
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error(e);
    }
  });
}

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = authEmail.value.trim();
    if (!email) {
      authError.textContent = 'Please enter your email address above first.';
      return;
    }
    
    try {
      authError.textContent = '';
      await auth.sendPasswordResetEmail(email);
      authError.style.color = '#10B981'; // green
      authError.textContent = 'Password reset email sent! Check your inbox.';
      setTimeout(() => { authError.style.color = 'var(--rose)'; authError.textContent = ''; }, 4000);
    } catch (err) {
      authError.textContent = err.message;
    }
  });
}

// ── API Key Modal ─────────────────────────────
if (saveApiKeyBtn) {
  saveApiKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) { apiKeyError.textContent = 'Please enter your API key.'; return; }
    
    apiKeyError.textContent = '';
    saveApiKeyBtn.textContent = 'Validating...';
    saveApiKeyBtn.disabled = true;

    // Use validateApiKey from chat.js
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
}

if (apiKeyInput) {
  apiKeyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKeyBtn.click();
  });
}

if (toggleKeyVis) {
  toggleKeyVis.addEventListener('click', () => {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
  });
}

if (changeKeyBtn) {
  changeKeyBtn.addEventListener('click', () => {
    state.apiKey = '';
    LS.remove('apiKey');
    appShell.style.display = 'none';
    apiKeyModal.classList.remove('hidden');
    apiKeyInput.value = '';
    apiKeyError.textContent = '';
    saveApiKeyBtn.textContent = 'Save & Launch ForgeAI →';
    saveApiKeyBtn.disabled = false;
  });
}
