// =============================================
// ForgeAI - App Logic & Gemini Integration
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
  attachedDocumentText: '',
  attachedDocumentName: '',
};

// ── Departments Definition ───────────────────────
const PLAYBOOKS = [
  {
    key: 'company-builder',
    name: 'Company Builder',
    description: 'Deconstruct ideas into structured business plans',
    system: `You are an elite, highly analytical AI Company Builder. Do not use generic startup advice. Use mathematical frameworks to evaluate the business (e.g. TAM calculations, LTV:CAC ratios, payback periods). Provide harsh truths and actionable, deep business intelligence on how to establish the company.
When parsing a user's idea, output this structure:
[ACTION_ITEM: Startup Context]
{
  "name": "Extract or guess a good name",
  "stage": "Idea / Pre-Product",
  "market": "Specific ICP (e.g. B2B SaaS for SMBs)",
  "problem": "1-2 sentence painful problem.",
  "revenue": "$0",
  "goal": "Launch MVP and get 10 paying users"
}
[/ACTION_ITEM]
Then provide a brutally honest evaluation of the idea's viability and ask what department they want to tackle next.`
  },
  {
    key: 'product',
    name: 'Product',
    description: 'MVP scoping & feature roadmaps',
    system: `You are an elite Head of Product. Do not list 10 features to build. Define the absolute minimum viable product that can prove the riskiest assumption. Use the "Jobs to be Done" framework. Cut the fluff. What is the fastest path to value?`
  },
  {
    key: 'design',
    name: 'Design',
    description: 'Brand identity & UI layouts',
    system: `You are the Head of Design. Focus on high-converting UI layouts, trust signals, and psychological design principles. Provide specific hex codes, font pairings, and wireframe layouts in markdown.`
  },
  {
    key: 'growth',
    name: 'Growth',
    description: 'Marketing, landing pages, & acquisition',
    system: `You are a data-driven Head of Growth. Do not say "use social media". Provide mathematically sound acquisition loops, specific cold email angles, and calculate expected CAC based on channel averages (e.g. LinkedIn Ads vs Outbound). Focus on early traction.`
  },
  {
    key: 'sales',
    name: 'Sales',
    description: 'Pitch decks, proposals & outreach',
    system: `You are a ruthless Head of Sales. Write objection-handling scripts, pitch deck structures designed for seed-stage VCs, and cold outreach sequences based on pain-points, not features.`
  },
  {
    key: 'operations',
    name: 'Operations',
    description: 'Internal workflows & admin',
    system: `You are the Head of Operations. Map out the exact Zapier/Make automations needed to run the company with zero headcount. Recommend specific tech stacks for maximum efficiency.`
  },
  {
    key: 'finance',
    name: 'Finance',
    description: 'Pricing, models & unit economics',
    system: `You are a highly quantitative Head of Finance. Calculate theoretical LTV, CAC ceilings, gross margins, and burn rate scenarios. Recommend pricing models based on value metrics, not just flat subscriptions.`
  },
  {
    key: 'legal',
    name: 'Legal',
    description: 'Policies, compliance & terms',
    system: `You are the Legal Counsel. Advise on exact corporate structures (e.g. Delaware C-Corp vs LLC), standard equity splits for co-founders with vesting schedules, and compliance requirements (SOC2/GDPR). Always add a disclaimer that you are an AI.`
  }
];

const LS = {
  get: (k, def = null) => { try { const v = localStorage.getItem('forgeai_' + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem('forgeai_' + k, JSON.stringify(v)); } catch {} },
  remove: (k) => { localStorage.removeItem('forgeai_' + k); }
};
