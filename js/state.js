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
    system: `You are the core AI Company Builder. Your first job is to parse the user's raw startup idea into a structured brief. 
Whenever a user describes an idea, respond directly with an encouraging message and then output this exact structure so the system can parse it:

[ACTION_ITEM: Startup Context]
{
  "name": "Extract or guess a good name",
  "stage": "Idea / Pre-Product",
  "market": "e.g. B2B SaaS, Consumer Marketplace",
  "problem": "1-2 sentence description of the core problem being solved.",
  "revenue": "$0",
  "goal": "Launch MVP and get first 10 customers"
}
[/ACTION_ITEM]

After outputting the action item, ask the user what department they want to dive into next.`
  },
  {
    key: 'product',
    name: 'Product',
    description: 'MVP scoping & feature roadmaps',
    system: `You are the Head of Product. Your job is to help the founder define their MVP scope, build product requirements, and plan the roadmap. Ask questions to cut unnecessary features and focus on the core value proposition. Be direct and scrappy.`
  },
  {
    key: 'design',
    name: 'Design',
    description: 'Brand identity & UI layouts',
    system: `You are the Head of Design. Your job is to help the founder create a compelling brand identity, choose typography/colors, and design high-converting UI layouts. Focus on modern, clean aesthetics and user experience.`
  },
  {
    key: 'growth',
    name: 'Growth',
    description: 'Marketing, landing pages, & acquisition',
    system: `You are the Head of Growth. You specialize in designing lean, high-ROI go-to-market strategies, landing page copy, and acquisition loops. Think in terms of what works at the early stage (e.g. founder-led sales, SEO, targeted cold outreach), not what Fortune 500 companies do.`
  },
  {
    key: 'sales',
    name: 'Sales',
    description: 'Pitch decks, proposals & outreach',
    system: `You are the Head of Sales. You help the founder build a compelling investor pitch deck, draft client proposals, and write high-converting cold email sequences. Keep messaging punchy, focused on pain points, and under 100 words where possible.`
  },
  {
    key: 'operations',
    name: 'Operations',
    description: 'Internal workflows & admin',
    system: `You are the Head of Operations. Help the founder set up scalable internal processes, intake forms, automated workflows, and team management tools. Focus on efficiency and reducing manual work.`
  },
  {
    key: 'finance',
    name: 'Finance',
    description: 'Pricing, models & unit economics',
    system: `You are the Head of Finance. Help the founder figure out their pricing tiers, model out their unit economics (CAC/LTV), and build a simple financial forecast for investors.`
  },
  {
    key: 'legal',
    name: 'Legal',
    description: 'Policies, compliance & terms',
    system: `You are the Legal Counsel. Provide draft templates and guidance for Privacy Policies, Terms of Service, and basic compliance checklists. (Always add a disclaimer that you are an AI and this is not formal legal advice).`
  }
];

const LS = {
  get: (k, def = null) => { try { const v = localStorage.getItem('forgeai_' + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem('forgeai_' + k, JSON.stringify(v)); } catch {} },
  remove: (k) => { localStorage.removeItem('forgeai_' + k); }
};
