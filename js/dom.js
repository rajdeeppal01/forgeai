const $ = id => document.getElementById(id);

// Auth UI
const authModal       = $('authModal');
const tabLogin        = $('tabLogin');
const tabRegister     = $('tabRegister');
const authEmail       = $('authEmail');
const authPassword    = $('authPassword');
const authError       = $('authError');
const authSubmitBtn   = $('authSubmitBtn');
const authModalTitle  = $('authModalTitle');
const authModalDesc   = $('authModalDesc');
const logoutBtn       = $('logoutBtn');

// API Key UI
const apiKeyModal     = $('apiKeyModal');
const apiKeyInput     = $('apiKeyInput');
const apiKeyError     = $('apiKeyError');
const saveApiKeyBtn   = $('saveApiKey');
const toggleKeyVis    = $('toggleKeyVisibility');
const changeKeyBtn    = $('changeKeyBtn');

// App UI
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

const sidebarToggle   = $('sidebarToggle');
const sidebarClose    = $('sidebarClose');
const contextPanelTgl = $('contextPanelToggle');
const cpClose         = $('cpClose');
const contextPanel    = $('contextPanel');
const sidebar         = $('sidebar');
const activePlaybookName = $('activePlaybookName');
const exportPdfBtn    = $('exportPdfBtn');
const exportPptxBtn   = $('exportPptxBtn');
const exportBtn       = $('exportBtn');
const clearChatBtn    = $('clearChatBtn');
const settingsBtn     = $('settingsBtn');
const settingsOverlay = $('settingsOverlay');
const settingsClose   = $('settingsClose');
const settingsKeyInput= $('settingsKeyInput');
const tourBtn         = $('tourBtn');
const updateKeyBtn    = $('updateKeyBtn');
const modelSelect     = $('modelSelect');
const clearAllDataBtn = $('clearAllDataBtn');
const themeToggleBtn  = document.querySelector('.theme-toggle-btn');
const globalLoader    = $('globalLoader');
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
const forgotPasswordLink = $('forgotPasswordLink');

// Chat Input Additions
const attachBtn      = $('attachBtn');
const fileUpload     = $('fileUpload');
